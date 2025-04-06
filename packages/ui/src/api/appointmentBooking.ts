"use server"

import { z } from "zod"

export type IapiResponse = {
  message?: string
  error?: string
  data?: any
}

const ldHeaders = new Headers({
  Authorization: `${process.env.AUTH_BASE_64}`,
  "Content-Type": "application/json",
  Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
})

// async function fnVerifyRecaptcha(token: string): Promise<boolean> {
//   const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
//   const URL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`

//   try {
//     const response = await fetch(URL, { method: "POST" })
//     const data = await response.json()
//     return data.success && data.score >= 0.5
//   } catch (error) {
//     console.error("reCAPTCHA verification error:", error)
//     return false
//   }
// }



async function fnVerifyRecaptcha(token: string): Promise<boolean> {
  const API_KEY = process.env.RECAPTCHA_ENTERPRISE_API_KEY
  const PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID
  const SITE_KEY = "6Lf_OtUqAAAAAJnRJhE_HHI_m242Iabra4FpaCW4"
  const EXPECTED_ACTION = "submit_form" // customize based on your action

  const apiUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${API_KEY}`

  const requestBody = {
    event: {
      token,
      expectedAction: EXPECTED_ACTION,
      siteKey: SITE_KEY,
    },
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()
    console.log("reCAPTCHA Enterprise response:", data)

    return data.tokenProperties?.valid && data.riskAnalysis?.score >= 0.5
  } catch (error) {
    console.error("reCAPTCHA Enterprise verification error:", error)
    return false
  }
}


const appointmentSchema = z.object({
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

export async function bookAppointmentAction(
  formData: z.infer<typeof appointmentSchema>
): Promise<IapiResponse> {

  const { date, time, timezone, contact, recaptchaToken } = formData

  const isHuman = await fnVerifyRecaptcha(recaptchaToken)
  if (!isHuman) {
    return { error: "reCAPTCHA verification failed" }
  }

  try {
    const payload = {
      date,
      time,
      tz: timezone,
      contact: JSON.stringify(contact)
    }

    const url = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.create_appointment`

    const response = await fetch(url, {
      method: "POST",
      headers: ldHeaders,
      redirect: "follow",
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { error: errorText }
    }

    const result = await response.json()
    return {
      message: "Booking confirmed successfully",
      data: result,
    }
  } catch (error) {
    console.error("Booking error:", error)
    return { error: "Server error occurred" }
  }
}
