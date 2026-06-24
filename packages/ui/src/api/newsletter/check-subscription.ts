"use server"

import { z } from "zod"

export type TCheckSubscriptionResult = {
  subscribed: boolean
  email?: string
  error?: string
}

const LdSchema = z.object({
  email: z.string().email("Please enter a valid email"),
})
//checks if the email is subscribed to the newsletter by querying the LENS backend  
export async function checkNewsletterSubscription(
  iEmail: string,
): Promise<TCheckSubscriptionResult> {
  const LdParsed = LdSchema.safeParse({ email: iEmail })

  if (!LdParsed.success) {
    return { subscribed: false, error: LdParsed.error.flatten().fieldErrors.email?.[0] }
  }

  const LEmail = LdParsed.data.email

  // Mirrors the other LENS backend actions (e.g. fetch-contact).
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  const LdHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  }
  // Query the LENS backend to check if the email is subscribed to the "Website" email group
  try {
    const LdCheckEmailGroup = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/resource/Email Group Member?fields=["email"]&filters={"email":"${LEmail}","email_group":"Website"}`,
      { method: "GET", headers: LdHeaders },
    )

    const LdCheckData = await LdCheckEmailGroup.json()

    if (LdCheckData?.data?.length > 0) {
      return { subscribed: true, email: LEmail }
    }

    return { subscribed: false, email: LEmail }
  } catch (err: any) {
    console.error("checkNewsletterSubscription error", err)
    return { subscribed: false, error: err?.message ?? String(err) }
  }
}
