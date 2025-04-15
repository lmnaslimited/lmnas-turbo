'use server'

import { TapiResponse } from "@repo/ui/type"


/**
 * Fetches the list of available timezones from the backend.
 * 
 * @returns A promise that resolves to a TapiResponse object containing either the timezones or an error.
 */
export async function fetchTimezones(): Promise<TapiResponse> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  // Define headers for the API request, including authorization and guest cookie info
  const ldHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  }

  try {
    // Construct the API endpoint URL for fetching timezones
    const LTimezoneUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.get_timezones`

    // Make a GET request to the timezones API
    const LdResponse = await fetch(LTimezoneUrl, {
      method: "GET",
      headers: ldHeaders,
      redirect: "follow",
    })

     // If the response is not OK (e.g., 404, 500), throw an error
    if (!LdResponse.ok) {
      throw new Error("Failed to fetch timezones")
    }

     // Parse the response body to JSON
    const LdJson = await LdResponse.json()

     // Return the parsed timezones with a success message
    return {
      message: "Timezones fetched successfully",
      data: LdJson.message,
    }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}
