"use server"

import { z } from "zod"
import { TapiResponse } from "@repo/ui/type"

async function fnVerifyRecaptcha(iToken: string): Promise<boolean> {
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`

  try {
    const LdRecaptchaResponse = await fetch(LRecaptchaUrl, { method: "POST" })
    const LdData = await LdRecaptchaResponse.json()
    return LdData.success && LdData.score >= 0.5
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}

const LdCommunicationSchema = z.object({
  email: z.string().email(),
  notes: z.string().min(1, "Message is required"),
  option: z.string().optional(),
  recaptchaToken: z.string(),
})

export async function sendCommunicationAction(iFormData: z.infer<typeof LdCommunicationSchema>): Promise<TapiResponse> {
  const ldHeaders = new Headers({
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  })

  const { email, notes, option, recaptchaToken } = iFormData

  const LIsHuman = await fnVerifyRecaptcha(recaptchaToken)
  if (!LIsHuman) {
    return { error: "reCAPTCHA verification failed" }
  }

  try {
    const LContactUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.templates.utils.send_message`

    const LdPayload = {
      sender: email,
      message: notes,
      subject: `From Website - enquiry type : ${option || "Free Trial"}`,
    }

    const LdResponse = await fetch(LContactUrl, {
      method: "POST",
      headers: ldHeaders,
      redirect: "follow",
      body: JSON.stringify(LdPayload),
    })

    if (!LdResponse.ok) {
      const errorText = await LdResponse.text()
      return { error: errorText }
    }

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
