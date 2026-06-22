"use server"

import { TleadApi } from "@repo/middleware/types"
import { linkFrappeRecordToPostHog } from "@repo/ui/api/crm/posthog-link"
import { PostHog } from "posthog-node"

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

// Verifies the Google reCAPTCHA token received from the client
async function fnVerifyRecaptchaToken(
  iRecaptchaToken: string,
): Promise<{ isHuman: boolean; score: number }> {
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  try {
    const LRecaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!LRecaptchaSecretKey) {
      console.error("Missing RECAPTCHA_SECRET_KEY")
      return { isHuman: false, score: 0 }
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
      return { isHuman: false, score: 0 };
    }

    const LdVerificationResult = await LdVerificationResponse.json()

    // Accept only if success is true and score >= 0.5
    return {
      isHuman:
        LdVerificationResult.success && LdVerificationResult.score >= 0.5,
      score: LdVerificationResult.score ?? 0,
    };
  } catch (idError) {
    console.error("reCAPTCHA verification error:", idError)
    return { isHuman: false, score: 0 }
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
    const { isHuman: LIsHumanUser, score: LRecaptchaScore } =
      await fnVerifyRecaptchaToken(idLeadFormData.recaptchaToken);

    // Capture reCAPTCHA result tied to the person's email
    posthog.capture({
      distinctId: idLeadFormData.email,
      event: "casestudy_recaptcha_verified",
      properties: {
        recaptcha_score: String(LRecaptchaScore),
        recaptcha_passed: LIsHumanUser,
        $set: {
          email: idLeadFormData.email,
          name: idLeadFormData.name,
        },
      },
    });

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
      await linkFrappeRecordToPostHog(
        "Lead",
        LdCreateLeadResult.data?.name,
        idLeadFormData.email,
      )

      return {
        data: LdCreateLeadResult.data,
        message: "created",
      }
    }

    // Lead already exists then return existing lead
    await linkFrappeRecordToPostHog(
      "Lead",
      LdLeadLookupResult.data[0]?.name,
      idLeadFormData.email,
    )

    return {
      data: LdLeadLookupResult.data[0],
      message: "exist",
    }
  } catch (idError) {
    console.error("LeadApi error:", idError)

    return {
      data: [],
      message: "error",
      error: idError instanceof Error ? idError.message : "Unexpected error",
    }
  }
}
