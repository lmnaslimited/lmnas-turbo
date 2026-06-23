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

export async function checkNewsletterSubscription(
  iEmail: string,
): Promise<TCheckSubscriptionResult> {
  const LdParsed = LdSchema.safeParse({ email: iEmail })

  if (!LdParsed.success) {
    return { subscribed: false, error: LdParsed.error.flatten().fieldErrors.email?.[0] }
  }

  const LEmail = LdParsed.data.email

  // The subscription backend runs behind a self-signed cert in dev
  // (https://...docker.localhost). Without this, Node's server-side fetch
  // rejects the cert and the check silently fails (returns not-subscribed).
  // Mirrors the other LENS backend actions (e.g. fetch-contact).
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  const LdHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  }

  try {
    const LdCheckEmailGroup = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/resource/Email Group Member?fields=["email"]&filters={"email":"${LEmail}","email_group":"Website"}`,
      { method: "GET", headers: LdHeaders },
    )

    const LdCheckData = await LdCheckEmailGroup.json()

    console.log(
      "checkNewsletterSubscription",
      LEmail,
      "status:",
      LdCheckEmailGroup.status,
      LdCheckData,
    )

    if (LdCheckData?.data?.length > 0) {
      return { subscribed: true, email: LEmail }
    }

    return { subscribed: false, email: LEmail }
  } catch (err: any) {
    console.error("checkNewsletterSubscription error", err)
    return { subscribed: false, error: err?.message ?? String(err) }
  }
}
