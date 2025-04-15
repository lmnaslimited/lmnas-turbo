"use server"

import { z } from "zod"
import { TapiResponse } from "@repo/ui/type"

// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(iToken: string): Promise<boolean> {
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`

  try {
    const LdRecaptchaResponse = await fetch(LRecaptchaUrl, { method: "POST" })
    const LdData = await LdRecaptchaResponse.json()
    // Return true only if verification is successful and the score is above threshold
    return LdData.success && LdData.score >= 0.5
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
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
 * 
 * Steps:
 * 1. Validate form data
 * 2. Verify reCAPTCHA to ensure it's submitted by a human
 * 3. Send the message to the LENS backend endpoint
 */
export async function sendCommunicationAction(idFormData: z.infer<typeof LdCommunicationSchema>): Promise<TapiResponse> {
  // Prepare necessary headers for API request
  const ldHeaders = new Headers({
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  })

  const { email, notes, option, recaptchaToken } = idFormData

   // Verify that the user is not a bot
  const LIsHuman = await fnVerifyRecaptcha(recaptchaToken)
  if (!LIsHuman) {
    return { error: "reCAPTCHA verification failed" }
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
    return {
      message: "Thank you for your message",
      data: LdResult,
    }
  } catch (error) {
    console.error("Server-side error:", error)
    return { error: "An error occurred, please try again later." }
  }
}
