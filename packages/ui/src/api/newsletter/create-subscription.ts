"use server"

// Zod is a TypeScript-first schema validation library recommended by Next.js
import { z } from "zod"
import { linkFrappeRecordByEmailToPostHog } from "@repo/ui/api/crm/posthog-link"

export type TnewsletterSubscriptionStatus =
  | "subscribed"
  | "already_subscribed"
  | "error"

export type TnewsletterSubscriptionState = {
  message: string
  email?: string
  status: TnewsletterSubscriptionStatus
}

// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(iToken: string): Promise<boolean> {
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`

  try {
    const LdResponse = await fetch(LRecaptchaUrl, { method: "POST" })
    const LdData = await LdResponse.json()

    // Return true only if verification is successful and the score is above threshold
    return LdData.success && LdData.score >= 0.5
    
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}

// Define expected structure and constraints for form data
const LdSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  recaptchaToken: z.string(),
})

export async function subscribeNewsletter(
  idPrevState: { message: string; status?: TnewsletterSubscriptionStatus },
  idFormData: FormData,
): Promise<TnewsletterSubscriptionState> {
  //headers for API requests
  const LdHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  }
  // Validate form input early to fail fast and give user feedback before hitting the backend
  const LdParsed = LdSchema.safeParse({
    email: idFormData.get("email"),
    recaptchaToken: idFormData.get("recaptchaToken"),
  })

  // If validation fails, return a user-friendly message without making any API requests
  if (!LdParsed.success) {
    const LdErrors = LdParsed.error.flatten().fieldErrors
    return {
      message:
        LdErrors.email?.[0] ??
        LdErrors.recaptchaToken?.[0] ??
        "Invalid input",
      status: "error",
    }
  }

  // At this point, we have a clean, validated email to use in API calls
  const LEmail = LdParsed.data.email

  // Disables TLS verification for local development
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  // Verify if the form submission is made by a human
  const LIsHuman = await fnVerifyRecaptcha(LdParsed.data.recaptchaToken,)
  if (!LIsHuman) {
    return {  message: "reCAPTCHA verification failed",
      status: "error",}
  }

  try {
    // First check: is this email already subscribed? Prevents duplicate entries and unnecessary API calls
    const LdCheckEmailGroup = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/resource/Email Group Member?fields=["email"]&filters={"email":"${LEmail}","email_group":"Website"}`,
      { method: "GET", headers: LdHeaders },
    )

    const LdCheckData = await LdCheckEmailGroup.json()

    // If email exists in the "Website" group, inform the user instead of trying to subscribe again
    if (LdCheckData?.data?.length > 0) {
      await linkFrappeRecordByEmailToPostHog(LEmail)
      return {
        message: "You're already subscribed!",
        email: LEmail,
        status: "already_subscribed",
      }
    }

    // If the email isn't already subscribed, submit it to the backend via a POST request
    const LdSubscribe = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/method/frappe.email.doctype.newsletter.newsletter.subscribe`,
      {
        method: "POST",
        headers: LdHeaders,
        body: JSON.stringify({ email: LEmail }),
      },
    )

    if (LdSubscribe.status === 429) {
      return {
        message: "Too many requests. Please wait a moment before trying again.",
        status: "error",
      }
    }

    // If the backend returns a failure response, throw and handle the error for user feedback
    if (!LdSubscribe.ok) {
      throw new Error(await LdSubscribe.text())
    }

    await linkFrappeRecordByEmailToPostHog(LEmail)

    return {
      message: "Please check your inbox!",
      email: LEmail,
      status: "subscribed",
    }
  } catch (err: any) {
    return {
      message: err.message || "An error occurred, please try again later.",
      status: "error",
    }
  }
}
