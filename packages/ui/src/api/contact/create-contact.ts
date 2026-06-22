"use server"

import { TcontactApi } from "@repo/middleware/types"
import { linkFrappeRecordToPostHog } from "@repo/ui/api/crm/posthog-link"
import { PostHog } from "posthog-node"

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
});
// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(
  iToken: string,
): Promise<{ isHuman: boolean; score: number }> {
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`

  try {
    const LdRecaptchaResponse = await fetch(LRecaptchaUrl, { method: "POST" });
    const LdData = await LdRecaptchaResponse.json();

    return {
      isHuman: LdData.success && LdData.score >= 0.5,
      score: LdData.score ?? 0,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { isHuman: false, score: 0 };
  }
}

export async function ContactApi(idFormdata: TcontactApi) {
  const LUrl = process.env.SUBSCRIBE_URL
  const LdHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  }

  // Prepare payload for contact creation
  const LdPayload = {
    first_name: idFormdata.formData.name,
    ...(idFormdata.formData.job && { designation: idFormdata.formData.job }),
    ...(idFormdata.formData.company && {
      company_name: idFormdata.formData.company,
    }),
    email_ids: [
      {
        email_id: idFormdata.formData.email,
        is_primary: 1,
      },
    ],
    ...(idFormdata.formData.phone && {
      phone_nos: [
        {
          phone: idFormdata.formData.phone,
          is_primary: 1,
        },
      ],
    }),
  }

  // Step 1: Verify reCAPTCHA
  const { isHuman: LIsHuman, score: LRecaptchaScore } = await fnVerifyRecaptcha(
    idFormdata.recaptchaToken,
  );

  // Capture reCAPTCHA result tied to the person's email
  posthog.capture({
    distinctId: idFormdata.formData.email,
    event: "contact_recaptcha_verified",
    properties: {
      recaptcha_score: String(LRecaptchaScore),
      recaptcha_passed: LIsHuman,
      $set: {
        email: idFormdata.formData.email,
        name: idFormdata.formData.name,
      },
    },
  });
  if (!LIsHuman) {
    return { error: "reCAPTCHA verification failed" }
  }

  try {
    // Step 2: Check if the contact already exists
    const LdContactResponse = await fetch(
      `${LUrl}/api/resource/Contact?filters=[["email_id", "=", "${idFormdata.formData.email}"]]`,
      {
        method: "GET",
        headers: LdHeaders,
        redirect: "follow",
      }
    )

    const LdContactResult = await LdContactResponse.json()

    // Step 3: Create a new contact if not found
    if (LdContactResult.data.length === 0) {
      const LdPostContact = await fetch(`${LUrl}/api/resource/Contact`, {
        method: "POST",
        headers: LdHeaders,
        body: JSON.stringify(LdPayload),
        redirect: "follow",
      })
      const LdPostContactResult = await LdPostContact.json()
      await linkFrappeRecordToPostHog(
        "Contact",
        LdPostContactResult.data?.name,
        idFormdata.formData.email,
      )

      return {
        data: LdPostContactResult.data,
        message: "created",
      }
    } else {
      await linkFrappeRecordToPostHog(
        "Contact",
        LdContactResult.data[0]?.name,
        idFormdata.formData.email,
      )

      // Contact already exists
      return {
        data: LdContactResult.data[0],
        message: "exist",
      }
    }
  } catch (error) {
    console.error("Error fetching events:", error)

    // Return empty data structure in case of error
    return {
      data: [],
      message: "error",
    }
  }
}
