"use server"

import { TEnvSource } from "@repo/middleware/types";
import { linkFrappeRecordToPostHog } from "@repo/ui/api/crm/posthog-link"
import { PostHog } from "posthog-node"

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  type TApi = {
    email: string;
    name: string;
    recaptchaToken: string;

    companyName?: string;
    companyDomain?: string;
    companyWebsite?: string;
    employeeCount?: string;

    interestReason?: string;
    createOpportunity?: boolean;
    sendEmail?: boolean;
    emailTemplate?: string;
    humanVerfied?: boolean;
    opportType?: string;
    source?: string;
    campaign?: string;
    itemName?: string;
    env: TEnvSource
}


/**
 * Verify Google reCAPTCHA token.
 */
async function fnVerifyRecaptchaToken( iRecaptchaToken: string): Promise<{ isHuman: boolean; score: number }> {
  try {
    const LRecaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!LRecaptchaSecretKey) {
      console.error("Missing RECAPTCHA_SECRET_KEY")
      return { isHuman: false, score: 0 }
    }
    // Send the client-generated reCAPTCHA token to Google's verification API.
    const LdVerificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: LRecaptchaSecretKey,
          response: iRecaptchaToken,
        }),
      },
    )
    // Treat a non-successful HTTP response as a failed verification.
    if (!LdVerificationResponse.ok) {
      console.error("reCAPTCHA API request failed:", LdVerificationResponse.status)
      return { isHuman: false, score: 0 }
    }
    
    const LdVerificationResult = await LdVerificationResponse.json()
    // reCAPTCHA v3 returns a score between 0.0 and 1.0.
    // Use 0 when Google does not return a valid numeric score.
    const LScore = typeof LdVerificationResult.score === "number" ? LdVerificationResult.score : 0

    return {
      isHuman: LdVerificationResult.success === true && LScore >= 0.5,
      score: LScore,
    }
  } catch (idError) {
    console.error("reCAPTCHA verification error:", idError)
    return { isHuman: false, score: 0 }
  }
}

/**
 * Load the configuration required to communicate with the CRM.
 *
 * The authentication header is kept in the server environment and
 * is never exposed to the browser.
 */
function fnGetCrmConfiguration(idEnv:TEnvSource) {
  const LBaseUrl = idEnv.env.url || process.env.SUBSCRIBE_URL
  const LAuthorizationHeader = idEnv.env.token || process.env.AUTH_BASE_64

  if (!LBaseUrl || !LAuthorizationHeader) {
    throw new Error("Missing required CRM environment variables")
  }

  return {
    baseUrl: LBaseUrl,
    headers: {
      Authorization: LAuthorizationHeader,
      "Content-Type": "application/json",
    },
  }
}

/**
 * Find an existing Lead using the submitted email address.
 *
 * Email is used as the lookup key to prevent creating duplicate Leads
 * when the same person submits the form multiple times.
 */
async function fnGetLeadByEmail(
  iEmail: string,
  iBaseUrl: string,
  idHeaders: Record<string, string>,
  iCampaign:string,
){
  const LFilters = JSON.stringify([
    ["email_id", "=", iEmail],
    // ["campaign_name", "=", iCampaign]
])
  // Limit the response to one record because only the first matching
  // Lead is required for this workflow.
  const LUrl = `${iBaseUrl}/api/resource/Lead?filters=${encodeURIComponent(LFilters)}&fields=["*"]&limit_page_length=1`

  const LdResponse = await fetch(LUrl, {
    method: "GET",
    headers: idHeaders,
  })

  if (!LdResponse.ok) {
    throw new Error(`Lead lookup failed: ${LdResponse.status}`)
  }

  const LdResult = await LdResponse.json()
  // Return the first matching Lead, or null when no Lead exists.
  return LdResult.data?.[0] ?? null
}

/**
 * Find an existing Open or Replied Opportunity for the Lead
 * that contains the specified item and campaign.
 *
 * Since the item details are stored in the Opportunity child table,
 * the parent Opportunities are retrieved first and their detailed
 * records are then checked until the first matching Opportunity is found.
 */
async function fnGetOpportunity(
  iLeadId: string,
  iBaseUrl: string,
  idHeaders: Record<string, string>,
  iCampaign: string,
  iItemName: string,
) {
  const LFilters = JSON.stringify([
    ["party_name", "=", iLeadId],
    ["status", "in", ["Open", "Replied"]],
  ])

  const LUrl =
    `${iBaseUrl}/api/resource/Opportunity` +
    `?filters=${encodeURIComponent(LFilters)}` +
    `&fields=["name"]` +
    `&limit_page_length=100`

  const LdResponse = await fetch(LUrl, {
    method: "GET",
    headers: idHeaders,
  })

  if (!LdResponse.ok) {
    throw new Error(`Opportunity lookup failed: ${LdResponse.status}`)
  }

  const LdResult = await LdResponse.json()

  // Check each Opportunity one by one and fetch its detailed record.
  // Return immediately when the first Opportunity containing the matching
  // item code and campaign is found.
  for (const LOpportunity of LdResult.data ?? []) {
    const LOpportunityDetailResponse = await fetch(
      `${iBaseUrl}/api/resource/Opportunity/${encodeURIComponent(
        LOpportunity.name,
      )}`,
      {
        method: "GET",
        headers: idHeaders,
      },
    )

    if (!LOpportunityDetailResponse.ok) {
      throw new Error(
        `Opportunity detail lookup failed: ${LOpportunityDetailResponse.status}`,
      )
    }

    const LOpportunityDetailResult =
      await LOpportunityDetailResponse.json()

    const LOpportunityDetail = LOpportunityDetailResult.data

    // Check whether any item in the child table matches both the requested
    // item and campaign.
    const LIsMatchingOpportunity = LOpportunityDetail.items?.some(
      (iItem: {
        item_code: string
        custom_campaign?: string
      }) =>
        iItem.item_code === iItemName &&
        iItem.custom_campaign === iCampaign,
    )

    if (LIsMatchingOpportunity) {
      return LOpportunityDetail
    }
  }

  return null
}

/**
 * Create a new Lead in the CRM.
 *
 * This function is called only when no existing Lead matches
 * the submitted email address.
 */
async function fnCreateLead(
  iEmail: string,
  iName: string,
  iBaseUrl: string,
  idHeaders: Record<string, string>,
  iCampaign: string,
  iSource: string,
  iCompanyName: string,
  iCompanyWebsite: string,
  iEmployeeCount: string
) {
  const LdResponse = await fetch(`${iBaseUrl}/api/resource/Lead`, {
    method: "POST",
    headers: idHeaders,
    body: JSON.stringify({
       email_id: iEmail, first_name: iName, campaign_name: iCampaign, source: iSource,
       company_name: iCompanyName,
       website: iCompanyWebsite,
       no_of_employees: iEmployeeCount
      }),
  })

  if (!LdResponse.ok) {
    throw new Error(`Lead creation failed: ${LdResponse.status}`)
  }

  const LdResult = await LdResponse.json()
  return LdResult.data
}

/**
 * Get an existing Lead or create a new Lead.
 *
 * This function centralizes the duplicate-prevention logic:
 *
 * 1. Search for a Lead using the email address.
 * 2. Return the existing Lead when found.
 * 3. Create and return a new Lead when no match exists.
 *
 * The `created` flag allows the caller to know whether a new
 * Lead was actually created during this request.
 */
async function fnGetOrCreateLead(
  iEmail: string,
  iName: string,
  iBaseUrl: string,
  idHeaders: Record<string, string>,
  iCampaign:string,
  iSource: string,
  iCompanyName: string,
  iCompanyWebsite: string,
  iEmployeeCount: string
) {
  const LdExistingLead = await fnGetLeadByEmail(iEmail, iBaseUrl, idHeaders, iCampaign)

  if (LdExistingLead) {
    return { lead: LdExistingLead, created: false }
  }

  const LdNewLead = await fnCreateLead(iEmail,iName, iBaseUrl, idHeaders, iCampaign, iSource, iCompanyName, iCompanyWebsite, iEmployeeCount)
  return { lead: LdNewLead, created: true }
}

/**
 * Create an Opportunity linked to an existing Lead.
 *
 * The Lead name returned by Frappe is used as `party_name`,
 * which establishes the relationship between the Opportunity
 * and the Lead.
 */
async function fnCreateOpportunity(
  iLeadName: string,
  iBaseUrl: string,
  idHeaders: Record<string, string>,
  iOpportunityType: string,
  iSource: string,
  iCampaign: string,
  iItemName: string,
  iCompanyWebsite: string,
  iEmployeeCount: string,
  iCompanyDomain: string,
  iInterestReason: string,
  iCompanyName: string
) {
  const LComment = `
              Beta Access Request Details:
              
              Company Name:
              ${iCompanyName || "-"},
              
              Company Domain:
              ${iCompanyDomain || "-"},
              
              Company Website:
              ${iCompanyWebsite || "-"},
              
              Employee Count:
              ${iEmployeeCount || "-"},
              
              Why interested:
              ${iInterestReason || "-"}
              `;
  const LdResponse = await fetch(
      `${iBaseUrl}/api/resource/Opportunity`,
      {
          method: "POST",
          headers: idHeaders,
          body: JSON.stringify({
              opportunity_from: "Lead",
              party_name: iLeadName,
              opportunity_type: iOpportunityType,
              source: iSource,
              transaction_date: new Date()
                  .toISOString()
                  .split("T")[0],
              website: iCompanyWebsite,
              no_of_employees: iEmployeeCount,
              items: [
                  {
                      item_code: iItemName,
                      qty: 1,
                      custom_campaign: iCampaign,
                      rate:0
                  },
              ],
              notes: [
                {
                  note: LComment
                }
              ]
          }),
      },
  )

  if (!LdResponse.ok) {
      throw new Error(
          `Opportunity creation failed: ${LdResponse.status}`,
      )
  }

  const LdResult = await LdResponse.json()

  return LdResult.data
}

async function fnCreateOpportunityComment(
  iOpportunityName: string,
  iComment: string,
  iBaseUrl: string,
  idHeaders: Record<string, string>
) {

  const LdResponse = await fetch(
      `${iBaseUrl}/api/resource/Comment`,
      {
          method: "POST",
          headers: idHeaders,
          body: JSON.stringify({
              comment_type: "Comment",
              reference_doctype: "Opportunity",
              reference_name: iOpportunityName,
              content: iComment,
          }),
      }
  );

  if (!LdResponse.ok) {
      throw new Error(
          `Opportunity comment creation failed: ${LdResponse.status}`
      );
  }

  return await LdResponse.json();
}

/**
 * Render and send an email using a Frappe Email Template.
 *
 * The Email Template is rendered first because the standard
 * `communication.email.make` method requires the final subject
 * and content when creating the Communication document.
 *
 * The existing Lead and Opportunity objects are reused here.
 * No additional Lead or Opportunity API request is required.
 */
async function fnCreateCommunication(
  iEmail: string,
  idLead: Record<string, unknown>,
  idOpportunity: Record<string, unknown> | null,
  iEmailTemplate: string,
  iBaseUrl: string,
  idHeaders: Record<string, string>,
) {
   /**
   * Use the Opportunity as the Communication reference when
   * an Opportunity was created.
   *
   * Otherwise, attach the Communication directly to the Lead.
   */
  const LReferenceDoctype = idOpportunity
    ? "Opportunity"
    : "Lead"

  const LReferenceName = idOpportunity
    ? idOpportunity.name
    : idLead.name

  /**
   * Render the selected Email Template.
   *
   * The existing Lead document is passed as the template context.
   * This allows Frappe to resolve variables such as:
   *
   * {{ doc.first_name }}
   * {{ doc.email_id }}
   * {{ doc.name }}
   *
   * without fetching the Lead again.
   */
  const LdTemplateResponse = await fetch(
    `${iBaseUrl}/api/method/frappe.email.doctype.email_template.email_template.get_email_template`,
    {
      method: "POST",
      headers: idHeaders,
      body: JSON.stringify({
        template_name: iEmailTemplate,
        doc: idLead,
      }),
    },
  )

  if (!LdTemplateResponse.ok) {
    const LError = await LdTemplateResponse.text()

    console.error("Email template rendering failed:", {
      status: LdTemplateResponse.status,
      response: LError,
    })

    throw new Error(
      `Email template rendering failed: ${LdTemplateResponse.status} - ${LError}`,
    )
  }

  const LdTemplateResult = await LdTemplateResponse.json()

  const LdEmailTemplate = LdTemplateResult.message

   /**
   * Create the Communication using the rendered Email Template
   * values and send the email through Frappe.
   *
   * `doctype` and `name` link the Communication to the
   * corresponding Lead or Opportunity.
   */
  const LdCommunicationResponse = await fetch(
    `${iBaseUrl}/api/method/frappe.core.doctype.communication.email.make`,
    {
      method: "POST",
      headers: idHeaders,
      body: JSON.stringify({
        recipients: iEmail,
        doctype: LReferenceDoctype,
        name: LReferenceName,
        subject: LdEmailTemplate.subject,
        content: LdEmailTemplate.message,
        send_email: 1,
        sent_or_received: "Sent",
        communication_medium: "Email",
      }),
    },
  )

  if (!LdCommunicationResponse.ok) {
    const LError = await LdCommunicationResponse.text()

    console.error("Email sending failed:", {
      status: LdCommunicationResponse.status,
      response: LError,
    })

    throw new Error(
      `Email sending failed: ${LdCommunicationResponse.status} - ${LError}`,
    )
  }

  const LResult = await LdCommunicationResponse.json()

  return LResult.message
}

/**
 * Track the result of the reCAPTCHA verification in PostHog.
 *
 * The email is used as the distinct ID so that verification events
 * can be associated with the corresponding Lead journey.
 */
function fnCaptureRecaptchaEvent(iEmail: string, iScore: number, iPassed: boolean) {
  try {
    posthog.capture({
      distinctId: iEmail,
      event: "lead_recaptcha_verified",
      properties: {
        recaptcha_score: String(iScore),
        recaptcha_passed: iPassed,
        $set: { email: iEmail },
      },
    })
  } catch (idError) {
    console.error("PostHog capture failed:", idError)
  }
}

/**
 * Main Lead processing workflow.
 *
 * The workflow performs the following steps:
 *
 * 1. Load the CRM configuration.
 * 2. Verify the reCAPTCHA token unless the request was already
 *    verified by a trusted internal flow.
 * 3. Find an existing Lead or create a new Lead.
 * 4. Optionally create an Opportunity linked to the Lead.
 * 5. Optionally render and send an Email Template.
 * 6. Return the created CRM records and processing metadata.
 */
export async function fnLeadToOpportunity(idLeadFormData: TApi) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    const {email, name, recaptchaToken, 
      companyName,
      companyDomain,
      companyWebsite,
      employeeCount, interestReason,
      createOpportunity, sendEmail, emailTemplate, humanVerfied, opportType, source,
      campaign,
      itemName, env
    } = idLeadFormData
    
    const { baseUrl: LBaseUrl, headers: LdCrmRequestHeaders,} = fnGetCrmConfiguration(env)
      
    /**
     * Verify the user unless the request has already been verified
     * by a trusted internal process.
     */
    if(!humanVerfied){
        
        const { isHuman: LIsHumanUser, score: LRecaptchaScore } = await fnVerifyRecaptchaToken(recaptchaToken)
        fnCaptureRecaptchaEvent(email, LRecaptchaScore, LIsHumanUser)
        if (!LIsHumanUser) {
            return { data: null, message: "error", error: "reCAPTCHA verification failed" }
          }
    }

    /**
     * Find the Lead by email or create a new Lead when no match
     * is found.
     */
    const { lead: LdLead, created: LLeadCreated, } = await fnGetOrCreateLead( email, name, LBaseUrl, LdCrmRequestHeaders, campaign!, source!, companyName!, companyWebsite!, employeeCount!)

    /**
   * Find an existing matching Opportunity or create a new one.
   *
   * The existing or newly created Opportunity is retained and reused later
   * when creating the Communication reference.
   */
    let LdOpportunity = null
    let LOpportunityCreated = false

    if (createOpportunity) {
        const LExistingOpportunity = await fnGetOpportunity( LdLead.name, LBaseUrl, LdCrmRequestHeaders, campaign!, itemName!,)

        if (LExistingOpportunity) {
          
            LdOpportunity = LExistingOpportunity
        } else {
            LdOpportunity = await fnCreateOpportunity(LdLead.name, LBaseUrl, LdCrmRequestHeaders, opportType!, source!, campaign!, itemName!,companyWebsite!, employeeCount!, companyDomain!, interestReason!, companyName!)
            LOpportunityCreated = true
        }
    }

     /**
     * Optionally send an email.
     *
     * The Email Template is required when email sending is enabled.
     */
    let LdCommunication = null
    if (sendEmail) {

      if(!emailTemplate){ throw new Error("Email template is required") }
      LdCommunication = await fnCreateCommunication(
        email,
        LdLead,
        LdOpportunity ?? null,
        emailTemplate,
        LBaseUrl,
        LdCrmRequestHeaders,
      )
    }

    /**
     * Return the complete workflow result.
     *
     * The metadata allows the caller to know which optional
     * operations were actually performed.
     */
    return {
      data: { lead: LdLead, opportunity: LdOpportunity, communication: LdCommunication },
      message: "success",
      meta: {
        leadCreated: LLeadCreated,
        opportunityCreated: LOpportunityCreated,
        emailSent: Boolean(LdCommunication),
      },
    }
  } catch (idError) {
    console.error("Lead processing failed:", idError)
    
    return {
      data: null,
      message: "error",
      error: idError instanceof Error ? idError.message : "Unexpected error",
    }
  }
}