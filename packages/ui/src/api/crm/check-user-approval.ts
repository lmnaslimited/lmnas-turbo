"use server"

import { cookies } from "next/headers"

/**
 * Check if a lead exists and has a qualifying opportunity.
 */
export async function fnCheckUserApproval(iEmail: string) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  const LBaseUrl = process.env.SUBSCRIBE_URL
  const LAuthorizationHeader = process.env.AUTH_BASE_64
  
  if (!LBaseUrl || !LAuthorizationHeader) {
    throw new Error("Missing required CRM environment variables")
  }

  const idHeaders = {
    Authorization: LAuthorizationHeader,
    "Content-Type": "application/json",
  }

  // 1. Fetch Lead by Email
  const LFilters = JSON.stringify([["email_id", "=", iEmail]])
  const LLeadUrl = `${LBaseUrl}/api/resource/Lead?filters=${encodeURIComponent(LFilters)}&fields=["name"]&limit_page_length=1`
  
  const LdLeadRes = await fetch(LLeadUrl, { method: "GET", headers: idHeaders })
  if (!LdLeadRes.ok) return { approved: false, reason: "LEAD_NOT_FOUND" }

  const LdLeadData = await LdLeadRes.json()
  const LdLead = LdLeadData.data?.[0]

  if (!LdLead) {
    return { approved: false, reason: "LEAD_NOT_FOUND" }
  }

  // 2. Fetch Opportunity linked to Lead
  const LOppFilters = JSON.stringify([
    ["party_name", "=", LdLead.name],
    ["source", "=", "Website"]
  ])
  const LOppUrl = `${LBaseUrl}/api/resource/Opportunity?filters=${encodeURIComponent(LOppFilters)}&fields=["name","status", "sales_stage"]&limit_page_length=0`

  const LdOppRes = await fetch(LOppUrl, { method: "GET", headers: idHeaders })
  if (!LdOppRes.ok) return { approved: false, reason: "OPPORTUNITY_CHECK_FAILED" }

  const LdOppData = await LdOppRes.json()
  const LdOppList: Array<{ name: string; status: string; sales_stage?: string }> = LdOppData.data ?? []

    // 2. Check if ANY opportunity has sales_stage === "Qualification"
    const LbIsApproved = LdOppList.some(
    (iOpp) => iOpp.sales_stage === "Qualification"
    )

  // 3. Evaluate Qualification
  if (LbIsApproved) {
    // Persist session state via HttpOnly Cookie for subsequent visits/refreshes
    const cookieStore = await cookies()
    cookieStore.set("lenscloud_user_approved", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 Days persistence
        sameSite: "lax",
        httpOnly: false, // Allows "use client" components to read it
        secure: process.env.NODE_ENV === "production",
    })

    return { approved: true, reason: "APPROVED" }
  }

  return { approved: false, reason: "NOT_QUALIFIED" }
}


// // // //
// This should be uncommented when move to n8n and above should be commented out


// "use server"

// import { cookies } from "next/headers"

// export async function fnVerifyUserWithN8n(iEmail: string) {
//   const LN8nWebhookUrl = process.env.N8N_VERIFY_USER_WEBHOOK_URL

//   if (!LN8nWebhookUrl) {
//     throw new Error("Missing N8N Webhook URL")
//   }

//   try {
//     // 1. Send email to n8n Webhook
//     const LdRes = await fetch(LN8nWebhookUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email: iEmail }),
//     })

//     if (!LdRes.ok) {
//       return { approved: false, reason: "N8N_VERIFICATION_FAILED" }
//     }

//     const LdData = await LdRes.json()

//     // 2. If n8n confirms qualification, set the 30-day cookie
//     if (LdData.approved) {
//       const cookieStore = await cookies()
//       cookieStore.set("lenscloud_user_approved", "true", {
//         path: "/",
//         maxAge: 60 * 60 * 24 * 30, // 30 Days
//         sameSite: "lax",
//         httpOnly: false, // Accessible by "use client" components
//         secure: process.env.NODE_ENV === "production",
//       })

//       return { approved: true, reason: "APPROVED" }
//     }

//     return { approved: false, reason: LdData.reason || "NOT_QUALIFIED" }
//   } catch (idError) {
//     console.error("n8n verification error:", idError)
//     return { approved: false, reason: "ERROR" }
//   }
// }