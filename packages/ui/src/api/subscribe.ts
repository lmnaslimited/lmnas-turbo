
'use server'

// Zod is a TypeScript-first schema validation library recommended by Next.js
import { z } from 'zod'

// Define expected structure and constraints for form data
const LdSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})


export async function subscribeNewsletter(idPrevState: { message: string }, idFormData: FormData):Promise<{ message: string }>
{
    //headers for API requests
const LdHeaders = {
  "Authorization": `${process.env.AUTH_BASE_64}`,
  'Content-Type': 'application/json',
  Cookie: 'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=',
}
    // Validate form input early to fail fast and give user feedback before hitting the backend
  const LdParsed = LdSchema.safeParse({
    email: idFormData.get('email'),
  })

   // If validation fails, return a user-friendly message without making any API requests
  if (!LdParsed.success) {
    return {
      message: LdParsed.error.flatten().fieldErrors.email?.[0] || 'Invalid input',
    }
  }

  // At this point, we have a clean, validated email to use in API calls
  const LEmail = LdParsed.data.email
  
  // Disables TLS verification for local development 
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  try {
    // First check: is this email already subscribed? Prevents duplicate entries and unnecessary API calls
    const LdCheckEmailGroup = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/resource/Email Group Member?fields=["email"]&filters={"email":"${LEmail}","email_group":"Website"}`,
      { method: 'GET', headers: LdHeaders }
    )

    const LdCheckData = await LdCheckEmailGroup.json()

    // If email exists in the "Website" group, inform the user instead of trying to subscribe again
    if (LdCheckData?.data?.length > 0) {
      return { message: "You're already subscribed!" }
    }

     // If the email isn't already subscribed, submit it to the backend via a POST request
    const LdSubscribe = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/method/frappe.email.doctype.newsletter.newsletter.subscribe`,
      {
        method: 'POST',
        headers: LdHeaders,
        body: JSON.stringify({ email: LEmail }),
      }
    )

    if (LdSubscribe.status === 429) {
        return { message: 'Too many requests. Please wait a moment before trying again.' }
      }

    // If the backend returns a failure response, throw and handle the error for user feedback
    if (!LdSubscribe.ok) {
      throw new Error(await LdSubscribe.text())
    }

    return { message: 'Please check your inbox!' }
  } catch (err: any) {
    return { message: err.message || 'An error occurred, please try again later.' }
  }
}
