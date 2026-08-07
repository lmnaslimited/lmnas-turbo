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

  const LLeadDoctype = doctype.lead.doctype || "Lead";
  const LdLeadFields = doctype.lead.field_name;

  const LCustomerDoctype = doctype.customer.doctype || "Customer";
  const LdCustomerFields = doctype.customer.field_name;

  const LOpportunityDoctype = doctype.opportunity.doctype || "Opportunity";
  const LdOpportunityFields = doctype.opportunity.field_name;

  if (!LBaseUrl || !LAuthorizationHeader) {
    throw new Error("Missing required CRM environment variables");
  }

  const idHeaders = {
    Authorization: LAuthorizationHeader,
    "Content-Type": "application/json",
  };

  try {
    // Fetch the lead matching the supplied email or identifier.
    const LdLeadFilters = JSON.stringify([[LdLeadFields.email_id, "=", iDistinctId]]);
    const LLeadUrl = `${LBaseUrl}/api/resource/${LLeadDoctype}?filters=${encodeURIComponent(LdLeadFilters)}&fields=${encodeURIComponent(JSON.stringify([
      LdLeadFields.name,
      LdLeadFields.email_id,
    ]))}&limit_page_length=1`;

    const LdLeadRes = await fetch(LLeadUrl, { method: "GET", headers: idHeaders });
    // Return immediately if the lead lookup fails.
    if (!LdLeadRes.ok) return { approved: false, is_customer: false, reason: "LEAD_NOT_FOUND" };

    const LdLeadData = await LdLeadRes.json();
    const LdLead = LdLeadData.data?.[0];

    // Stop if no matching lead exists.
    if (!LdLead) {
      return { approved: false, is_customer: false, reason: "LEAD_NOT_FOUND" };
    }

    const LEmailId = LdLead[LdLeadFields.email_id];

     // Determine whether the lead is already a customer.
    let lIsCustomer = false;
    if (LEmailId) {
      const LdCustomerFilters = JSON.stringify([
        [LdCustomerFields.email_id, "=", LEmailId]
      ]);
      const LCustomerUrl = `${LBaseUrl}/api/resource/${LCustomerDoctype}?filters=${encodeURIComponent(LdCustomerFilters)}&fields=${encodeURIComponent(JSON.stringify([
        LdCustomerFields.name,
      ]))}&limit_page_length=1`;

      const LdCustomerRes = await fetch(LCustomerUrl, { method: "GET", headers: idHeaders });
      // Mark the user as a customer if a matching record exists.
      if (LdCustomerRes.ok) {
        const LdCustomerData = await LdCustomerRes.json();
        if (LdCustomerData.data && LdCustomerData.data.length > 0) {
          lIsCustomer = true;
        }
      }
    }

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
        approved: false,
        is_customer: lIsCustomer,
        email: LEmailId,
        reason: "NOT_QUALIFIED"
      };
  }else{
    return {
      approved: false,
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