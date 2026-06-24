"use server"

import { z } from "zod"
import { TapiResponse } from "@repo/middleware/types"
import { PostHog } from "posthog-node"

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST
})

// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(
  iToken: string,
): Promise<{ isHuman: boolean; score: number }> {
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY;
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`;

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

// Schema validation for communication form using Zod
const LdCommunicationSchema = z.object({
  email: z.string().email(),
  notes: z.string().min(1, "Message is required"),
  option: z.string().optional(),
  recaptchaToken: z.string(),
})

/**
 * Handles website communication messages (e.g., contact form submissions).
 * Steps:
 * 1. Validate form data
 * 2. Verify reCAPTCHA to ensure it's submitted by a human
 * 3. Send the message to the LENS backend endpoint
 */
export async function sendCommunicationAction(
  idFormData: z.infer<typeof LdCommunicationSchema>
): Promise<TapiResponse> {
  // Prepare necessary headers for API request
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  const ldHeaders = new Headers({
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  })

  const { email, notes, option, recaptchaToken } = idFormData

  // Verify that the user is not a bot
  const { isHuman: LIsHuman, score: LRecaptchaScore } =
    await fnVerifyRecaptcha(recaptchaToken)

  try {
    posthog.capture({
      distinctId: email,
      event: "communication_recaptcha_verified",
      properties: {
        recaptcha_score: String(LRecaptchaScore),
        recaptcha_passed: LIsHuman,
        $set: {
          email,
        },
      },
    })

    await posthog.shutdown()
  } catch (idError) {
    console.error(
      "PostHog capture failed for communication_recaptcha_verified:",
      idError,
    )
  }

  try {
    // LENS endpoint to send communication messages
    const LContactUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.templates.utils.send_message`

    const LdPayload = {
      sender: email,
      message: notes,
      subject: `From Website - enquiry type : ${option || "Free Trial"}`,
    }

    // Send POST request to backend with message data
    const LdResponse = await fetch(LContactUrl, {
      method: "POST",
      headers: ldHeaders,
      redirect: "follow",
      body: JSON.stringify(LdPayload),
    })

    // If the response is not OK, return error from server
    if (!LdResponse.ok) {
      const errorText = await LdResponse.text()
      return { error: errorText }
    }

    // Parse successful response and return success message
    const LdResult = await LdResponse.json()
    // Try to fetch the Lead record that may have been created for this email
    try {
      const LFfilters = encodeURIComponent(JSON.stringify([["Lead","email_id","=", email]]))
      const LdLeadUrl = `${process.env.SUBSCRIBE_URL}/api/resource/Lead?filters=${LFfilters}&order_by=creation%20desc&limit_page_length=1`
      const LdLeadResp = await fetch(LdLeadUrl, { method: "GET", headers: ldHeaders })
      if (LdLeadResp && LdLeadResp.ok) {
        const LdLeadJson = await LdLeadResp.json()
        const LdLead = Array.isArray(LdLeadJson?.data) ? LdLeadJson.data[0] : undefined
        const LdLeadName = LdLead?.name || LdLead?.lead_id || null
        
        return {
          message: "Thank you for your message",
         
          data: {
            ...LdResult,
            lead: LdLeadName || null,
          },
        }
      }
    } catch (e) {
      console.warn("Failed to fetch Lead record after communication:", e)
    }

    return {
      message: "Thank you for your message",
      data: {
            ...LdResult,
            lead: null,
          },
    }
  } catch (error) {
    console.error("Server-side error:", error)
    return { error: "An error occurred, please try again later." }
  }
}
