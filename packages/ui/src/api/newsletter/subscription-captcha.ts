"use server"

import z from "zod"
import { subscribeNewsletter, TnewsletterSubscriptionState, TnewsletterSubscriptionStatus } from "./create-subscription"

const LdCaptchaSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    recaptchaToken: z.string(),
  })
  
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

  export async function fnSubscribewithCaptcha(
    idPrevState: {
      message: string
      status?: TnewsletterSubscriptionStatus
    },
    idFormData: FormData,
  ): Promise<TnewsletterSubscriptionState> {
    const LdParsed = LdCaptchaSchema.safeParse({
      email: idFormData.get("email"),
      recaptchaToken: idFormData.get("recaptchaToken"),
    })
  
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
    // Recaptcha Token
    const LIsHuman = await fnVerifyRecaptcha(
      LdParsed.data.recaptchaToken,
    )
  
    if (!LIsHuman) {
      return {
        message: "reCAPTCHA verification failed",
        status: "error",
      }
    }
  
    // re-use existing newsletter logic
    return subscribeNewsletter(idPrevState, idFormData)
  }