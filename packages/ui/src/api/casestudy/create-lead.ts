"use server"

import { TleadApi } from "@repo/middleware/types"

// Verifies the Google reCAPTCHA token received from the client
async function fnVerifyRecaptchaToken(
  iRecaptchaToken: string,
): Promise<boolean> {
  try {
    const LRecaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!LRecaptchaSecretKey) {
      console.error("Missing RECAPTCHA_SECRET_KEY")
      return false
    }

    // Send token to Google for verification
    const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LRecaptchaSecretKey}&response=${iRecaptchaToken}`

    const LdVerificationResponse = await fetch(LRecaptchaUrl, {
      method: "POST",
    })

    if (!LdVerificationResponse.ok) {
      console.error(
        "reCAPTCHA API request failed:",
        LdVerificationResponse.status,
      )
      return false
    }

    const LdVerificationResult = await LdVerificationResponse.json()

    // Accept only if success is true and score >= 0.5
    return LdVerificationResult.success && LdVerificationResult.score >= 0.5
  } catch (LError) {
    console.error("reCAPTCHA verification error:", LError)
    return false
  }
}

// Main function handles the lead creation process for the case study subscription form
export async function fnLeadCreation(idLeadFormData: TleadApi) {
  try {
    const LBaseUrl = process.env.SUBSCRIBE_URL
    const LAuthorizationHeader = process.env.AUTH_BASE_64

    if (!LBaseUrl || !LAuthorizationHeader) {
      throw new Error("Missing required environment variables")
    }

    const LdCrmRequestHeaders = {
      Authorization: LAuthorizationHeader,
      "Content-Type": "application/json",
      Cookie:
        "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
    }

    // Verify the reCAPTCHA token
    const LIsHumanUser = await fnVerifyRecaptchaToken(
      idLeadFormData.recaptchaToken,
    )

    if (!LIsHumanUser) {
      return {
        error: "reCAPTCHA verification failed",
        message: "error",
      }
    }

    // Check if a Lead with the given email already exists
    const LdLeadLookupResponse = await fetch(
      `${LBaseUrl}/api/resource/Lead?filters=[["email_id","=","${idLeadFormData.email}"]]`,
      {
        method: "GET",
        headers: LdCrmRequestHeaders,
      },
    )

    if (!LdLeadLookupResponse.ok) {
      throw new Error(`Lead fetch failed: ${LdLeadLookupResponse.status}`)
    }

    const LdLeadLookupResult = await LdLeadLookupResponse.json()

    // If no lead exists then create a new lead
    if (!LdLeadLookupResult?.data?.length) {
      const LdNewLeadPayload = {
        first_name: idLeadFormData.name,
        email_id: idLeadFormData.email,
      }

      const LdCreateLeadResponse = await fetch(
        `${LBaseUrl}/api/resource/Lead`,
        {
          method: "POST",
          headers: LdCrmRequestHeaders,
          body: JSON.stringify(LdNewLeadPayload),
        },
      )

      if (!LdCreateLeadResponse.ok) {
        throw new Error(`Lead creation failed: ${LdCreateLeadResponse.status}`)
      }

      const LdCreateLeadResult = await LdCreateLeadResponse.json()

      return {
        data: LdCreateLeadResult.data,
        message: "created",
      }
    }

    // Lead already exists then return existing lead
    return {
      data: LdLeadLookupResult.data[0],
      message: "exist",
    }
  } catch (LError) {
    console.error("LeadApi error:", LError)

    return {
      data: [],
      message: "error",
      error: LError instanceof Error ? LError.message : "Unexpected error",
    }
  }
}
