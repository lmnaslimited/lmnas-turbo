"use server"

import { TleadApi } from "@repo/middleware/types"

// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(iToken: string): Promise<boolean> {
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY
  // Construct the verification URL with secret key and user token
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`

  try {
    // Make a POST request to Google's reCAPTCHA API
    const LdRecaptchaResponse = await fetch(LRecaptchaUrl, { method: "POST" })
    // Parse the response JSON
    const LdData = await LdRecaptchaResponse.json()
    // Return true only if verification is successful and the score is above threshold
    return LdData.success && LdData.score >= 0.5
  } catch (error) {
    // Log error and return false if verification fails
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}

export async function LeadApi(idFormdata: TleadApi) {
  const LUrl = process.env.SUBSCRIBE_URL
  const LdHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  }

  // Prepare payload for Lead creation
  const LdPayload = {
    first_name: idFormdata.name,
    email_id: idFormdata.email,
  }

  // Step 1: Verify reCAPTCHA
  const LIsHuman = await fnVerifyRecaptcha(idFormdata.recaptchaToken)
  if (!LIsHuman) {
    return { error: "reCAPTCHA verification failed" }
  }

  try {
    // Step 2: Check if the Lead with the given email already exists
    const LdLeadResponse = await fetch(
      `${LUrl}/api/resource/Lead?filters=[["email_id", "=", "${idFormdata.email}"]]`,
      {
        method: "GET",
        headers: LdHeaders,
        redirect: "follow",
      }
    )

    // Parse the response JSON from the GET request
    const LdLeadResult = await LdLeadResponse.json()

    // Step 3: Create a new Lead if one does not already exist
    if (LdLeadResult.data.length === 0) {
      const LdPostContact = await fetch(`${LUrl}/api/resource/Lead`, {
        method: "POST",
        headers: LdHeaders,
        body: JSON.stringify(LdPayload),
        redirect: "follow",
      })

      // Parse the response JSON from the POST request
      const LdPostContactResult = await LdPostContact.json()

      // Return success response with created Lead data
      return {
        data: LdPostContactResult.data,
        message: "created",
      }
    } else {
      // Lead already exists, return existing data
      return {
        data: LdLeadResult.data[0],
        message: "exist",
      }
    }
  } catch (error) {
    console.error("Error fetching events:", error)

    // Return error response with empty data structure
    return {
      data: [],
      message: "error",
    }
  }
}
