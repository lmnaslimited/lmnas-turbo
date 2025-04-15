"use server"

import { z } from "zod"
import { TapiResponse } from "@repo/ui/type"

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

// Schema validation for the appointment booking form using Zod
const LdAppointmentSchema = z.object({
  date: z.string(),
  time: z.string(),
  timezone: z.string(),
  contact: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    notes: z.string().optional(),
  }),
  recaptchaToken: z.string(),
})

/**
 * Handles appointment booking by:
 * 1. Verifying reCAPTCHA token to prevent bot submissions
 * 2. Validating input data
 * 3. Sending booking data to the LENS API
 */
export async function bookAppointmentAction(
  idFormData: z.infer<typeof LdAppointmentSchema>
): Promise<TapiResponse> {

   // Prepare API headers including authentication and session cookies
  const ldHeaders = new Headers({
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  })

  const { date, time, timezone, contact, recaptchaToken } = idFormData

  // Verify if the form submission is made by a human
  const LIsHuman = await fnVerifyRecaptcha(recaptchaToken)
  if (!LIsHuman) {
    return { error: "reCAPTCHA verification failed" }
  }

  try {
    // Prepare the payload to be sent to the LENS booking endpoint
    const LdPayload = {
      date,
      time,
      tz: timezone,
      contact: JSON.stringify(contact),
    }

    const LBookingUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.create_appointment`

     // Send the appointment request
    const LdResponse = await fetch(LBookingUrl, {
      method: "POST",
      headers: ldHeaders,
      redirect: "follow",
      body: JSON.stringify(LdPayload),
    })

    // If request fails, return error details
    if (!LdResponse.ok) {
      const lErrorText = await LdResponse.text()
      return { error: lErrorText }
    }

    // On success, return the booking confirmation
    const LdResult = await LdResponse.json()
    return {
      message: "Booking confirmed successfully",
      data: LdResult,
    }
  } catch (error) {
    console.error("Booking error:", error)
    return { error: "Server error occurred" }
  }
}
