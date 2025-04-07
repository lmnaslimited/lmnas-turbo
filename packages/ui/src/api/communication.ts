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

async function fnVerifyRecaptcha(token: string): Promise<boolean> {
  const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
  const URL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`

  try {
    const response = await fetch(URL, { method: "POST" })
    const data = await response.json()
    return data.success && data.score >= 0.5
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}

// schema for communication form
const communicationSchema = z.object({
  email: z.string().email(),
  notes: z.string().min(1, "Message is required"),
  option: z.string().optional(),
  recaptchaToken: z.string(),
})

export async function sendCommunicationAction(
  formData: z.infer<typeof communicationSchema>
): Promise<IapiResponse> {
    const { email, notes, option, recaptchaToken } = formData

//   // Optional: reCAPTCHA validation
  const isHuman = await fnVerifyRecaptcha(recaptchaToken)
  if (!isHuman) {
    return { error: "reCAPTCHA verification failed" }
  }

  try {
    const url = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.templates.utils.send_message`

    const payload = {
      sender: email,
      message: notes,
      subject: `From Website - enquiry type : ${option || "Free Trial"}`,
    }

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
      message: "Thank you for your message",
      data: result,
    }
  } catch (error) {
    console.error("Server-side error:", error)
    return { error: "An error occurred, please try again later." }
  }
}