
'use server'

import { z } from 'zod'

// Zod schema
const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

const myHeaders = {
  "Authorization": `${process.env.AUTH_BASE_64}`,
  'Content-Type': 'application/json',
  Cookie: 'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=',
}

export async function subscribeNewsletter(prevState: any, formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return {
      message: parsed.error.flatten().fieldErrors.email?.[0] || 'Invalid input',
    }
  }

  const email = parsed.data.email
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  try {
    const checkRes = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/resource/Email Group Member?fields=["email"]&filters={"email":"${email}","email_group":"Website"}`,
      { method: 'GET', headers: myHeaders }
    )

    const checkData = await checkRes.json()

    if (checkData?.data?.length > 0) {
      return { message: "You're already subscribed!" }
    }

    const subscribeRes = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/method/frappe.email.doctype.newsletter.newsletter.subscribe`,
      {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ email }),
      }
    )

    if (!subscribeRes.ok) {
      throw new Error(await subscribeRes.text())
    }

    return { message: 'Please check your inbox!' }
  } catch (err: any) {
    return { message: err.message || 'An error occurred, please try again later.' }
  }
}
