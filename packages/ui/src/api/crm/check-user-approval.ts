"use server"

import { TEnvSource } from "@repo/middleware/types";

/**
 * Check whether a user has an approved opportunity in CRM.
 */
export async function fnCheckUserApproval({
  doctype,
  env,
  iDistinctId,
}: {
  doctype: Record<string, any>;
  env: TEnvSource;
  iDistinctId: string;
}) {
  // Prevent SSL errors in development if necessary
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const LBaseUrl = env.env.url || process.env.SUBSCRIBE_URL;
  const LAuthorizationHeader = env.env.token || process.env.AUTH_BASE_64;

  const LPlatformUrl = env.env.platformUrl || process.env.NEXT_PUBLIC_FRAPPE_URL
  const LPlatformToken = env.env.platformToken || process.env.PLATFORM_TOKEN

  const LLeadDoctype = doctype.lead.doctype || "Lead";
  const LdLeadFields = doctype.lead.field_name;

  const LCustomerDoctype = doctype.customer.doctype || "Customer";
  const LdCustomerFields = doctype.customer.field_name;

  const LOpportunityDoctype = doctype.opportunity.doctype || "Opportunity";
  const LdOpportunityFields = doctype.opportunity.field_name;

  const LCustomerMember = doctype.customer_member.doctype || "Customer Member"
  const LdCustomerMemberFields = doctype.customer_member.field_name

  if (!LBaseUrl || !LAuthorizationHeader || !LPlatformToken || !LPlatformUrl) {
    throw new Error("Missing required CRM environment variables");
  }

  const idHeaders = {
    Authorization: LAuthorizationHeader,
    "Content-Type": "application/json",
  };

  try {
    // check if there is customer with same primary domain in the platform
    // This check is used for admin / member scenario
    const LEmailDomain = iDistinctId.split("@")[1]?.trim().toLowerCase();

    let LIsDomain = false;

    if (LEmailDomain) {
      const LdDomainFilters = JSON.stringify([
        [
          "primary_domain",
          "=",
          `${LEmailDomain}`,
        ],
      ]);

      const LDomainCustomerUrl =
        `${LPlatformUrl}/api/resource/${LCustomerDoctype}` +
        `?filters=${encodeURIComponent(LdDomainFilters)}` +
        `&fields=${encodeURIComponent(
          JSON.stringify([LdCustomerFields.name])
        )}` +
        `&limit_page_length=1`;

      const LdDomainCustomerRes = await fetch(
        LDomainCustomerUrl,
        {
          method: "GET",
          headers:  {
            Authorization: LPlatformToken,
            "Content-Type": "application/json",
          }
        }
      );

      if (LdDomainCustomerRes.ok) {
        const LdDomainCustomerData =
          await LdDomainCustomerRes.json();

        LIsDomain =
          Array.isArray(LdDomainCustomerData.data) &&
          LdDomainCustomerData.data.length > 0;
      }
    }

    // Determine whether the lead is already a customer Member in platform.
    let lIsCustomer = false;
  
    const LdCustomerFilters = JSON.stringify([
      [LdCustomerMemberFields.email_id, "=", iDistinctId]
    ]);
    const LCustomerUrl = `${LPlatformUrl}/api/resource/${LCustomerMember}?filters=${encodeURIComponent(LdCustomerFilters)}&fields=${encodeURIComponent(JSON.stringify([
      LdCustomerMemberFields.name,
    ]))}&limit_page_length=1`;

    const LdCustomerRes = await fetch(LCustomerUrl, 
      { method: "GET", 
        headers: {
          Authorization: LPlatformToken,
          "Content-Type": "application/json",
        } });
    // Mark the user as a customer if a matching record exists.
    if (LdCustomerRes.ok) {
      const LdCustomerData = await LdCustomerRes.json();
      if (LdCustomerData.data && LdCustomerData.data.length > 0) {
        lIsCustomer = true;
      }
    }

    // Fetch the lead matching the supplied email or identifier.
    const LdLeadFilters = JSON.stringify([[LdLeadFields.email_id, "=", iDistinctId]]);
    const LLeadUrl = `${LBaseUrl}/api/resource/${LLeadDoctype}?filters=${encodeURIComponent(LdLeadFilters)}&fields=${encodeURIComponent(JSON.stringify([
      LdLeadFields.name,
      LdLeadFields.email_id,
    ]))}&limit_page_length=1`;

    const LdLeadRes = await fetch(LLeadUrl, { method: "GET", headers: idHeaders });
    // Return immediately if the lead lookup fails.
    if (!LdLeadRes.ok) return { approved: LIsDomain, is_customer: lIsCustomer, reason: "LEAD_CHECK_FAILED" };

    const LdLeadData = await LdLeadRes.json();
    const LdLead = LdLeadData.data?.[0];

    // Stop if no matching lead exists.
    if (!LdLead) {
      return { approved: LIsDomain, is_customer: lIsCustomer, reason: "LEAD_NOT_FOUND" };
    }

    const LEmailId = LdLead[LdLeadFields.email_id];

    // Fetch all website opportunities linked to the lead.
    const LdOppFilters = JSON.stringify([
      [LdOpportunityFields.party_name, "=", LdLead.name],
      [LdOpportunityFields.source, "=", "Website"]
    ]);
    const LOppUrl = `${LBaseUrl}/api/resource/${LOpportunityDoctype}?filters=${encodeURIComponent(LdOppFilters)}&fields=${encodeURIComponent(JSON.stringify([
      LdOpportunityFields.name,
      LdOpportunityFields.status,
      LdOpportunityFields.sales_stage,
    ]))}&limit_page_length=0`;

    const LdOppRes = await fetch(LOppUrl, { method: "GET", headers: idHeaders });
    // Return if the opportunity lookup fails.
    if (!LdOppRes.ok) {
      return { 
        approved: false, 
        is_customer: lIsCustomer, 
        email: LEmailId, 
        reason: "OPPORTUNITY_CHECK_FAILED" 
      };
    }

    const LdOppData = await LdOppRes.json();
    // Extract the opportunity list from the CRM response.
    const LdOppList: Array<Record<string, any>> = LdOppData.data ?? [];
    
    if(LdOppList.length > 0){
      // Check whether any opportunity has reached the Qualification stage.
      const LIsApproved = LdOppList.some(
        (iOpp) => iOpp[LdOpportunityFields.sales_stage] === "Qualification"
      );

      // Return an approved response if the user qualifies.
      if (LIsApproved) {
        return {
          approved: true,
          is_customer: lIsCustomer,
          email: LEmailId,
          reason: "APPROVED"
        };
      }
      // Return a pending review response when no qualifying opportunity exists.
      return {
        approved: LIsDomain,
        is_customer: lIsCustomer,
        email: LEmailId,
        reason: "NOT_QUALIFIED"
      };
  }else{
    return {
      approved: LIsDomain,
      is_customer: lIsCustomer,
      email: LEmailId,
      reason: "NO_OPPORTUNITY"
    };
  }

  } catch (idError) {
    console.error("Error in fnCheckUserApproval:", idError);
    return { approved: false, is_customer: false, reason: "SERVER_ERROR" };
  }
}


// // // //
// This should be uncommented when move to n8n and above should be commented out


// "use server"

// export async function fnVerifyUserWithN8n(iEmail: string) {
//   const LN8nWebhookUrl = process.env.N8N_VERIFY_USER_WEBHOOK_URL;

//   if (!LN8nWebhookUrl) {
//     throw new Error("Missing N8N_VERIFY_USER_WEBHOOK_URL environment variable");
//   }

//   try {
//     // 1. Post target email to n8n Webhook
//     const LdRes = await fetch(LN8nWebhookUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email: iEmail }),
//     });

//     if (!LdRes.ok) {
//       return { 
//         approved: false, 
//         is_customer: false, 
//         email: iEmail, 
//         status: 'unapproved', 
//         reason: "N8N_VERIFICATION_FAILED" 
//       };
//     }

//     const LdData = await LdRes.json();
//     const LbApproved = Boolean(LdData?.approved);
//     const LbIsCustomer = Boolean(LdData?.is_customer || LdData?.isCustomer);
//     const LReason = LdData?.reason || (LbApproved ? "APPROVED" : "NOT_QUALIFIED");

//     // Map internal status string to match UI expectations
//     let LStatus: 'approved' | 'review_pending' | 'unapproved' = 'unapproved';
//     if (LbApproved) {
//       LStatus = 'approved';
//     } else if (LReason === 'NOT_QUALIFIED' || LReason === 'REVIEW_PENDING') {
//       LStatus = 'review_pending';
//     }

//     // 2. Set approval and customer status cookies upon qualification
//     if (LbApproved) {
//       
//     return {
//       approved: LbApproved,
//       is_customer: LbIsCustomer,
//       email: LdData?.email || iEmail,
//       status: LStatus,
//       reason: LReason
//     };

//   } catch (idError) {
//     console.error("n8n verification error:", idError);
//     return { 
//       approved: false, 
//       is_customer: false, 
//       email: iEmail, 
//       status: 'unapproved', 
//       reason: "SERVER_ERROR" 
//     };
//   }
// }