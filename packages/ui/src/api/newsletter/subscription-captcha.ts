"use server"

import z from "zod"
import { subscribeNewsletter, TnewsletterSubscriptionState, TnewsletterSubscriptionStatus } from "./create-subscription"
import { PostHog } from "posthog-node"

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

const LdCaptchaSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  recaptchaToken: z.string(),
})

// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(
  iToken: string
): Promise<{ isHuman: boolean; score: number }> {
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`

  try {
    const LdResponse = await fetch(LRecaptchaUrl, { method: "POST" });
    const LdData = await LdResponse.json();
    return {
      isHuman: LdData.success && LdData.score >= 0.5,
      score: LdData.score ?? 0,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { isHuman: false, score: 0 };
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
        LdErrors.email?.[0] ?? LdErrors.recaptchaToken?.[0] ??"Invalid input",
      status: "error",
    }
  }
  const { isHuman: LIsHuman, score: LRecaptchaScore } = await fnVerifyRecaptcha(
    LdParsed.data.recaptchaToken,
  );

  posthog.capture({
    distinctId: LdParsed.data.email,
    event: "newsletter_recaptcha_verified",
    properties: {
      recaptcha_score: String(LRecaptchaScore),
      recaptcha_passed: LIsHuman,
      $set: {
        email: LdParsed.data.email,
      },
    },
  });

  if (!LIsHuman) {
    return {
      message: "reCAPTCHA verification failed",
      status: "error",
    }
  }
    // re-use existing newsletter logic
  return subscribeNewsletter(idPrevState, idFormData)
}