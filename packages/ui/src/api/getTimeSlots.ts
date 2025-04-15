'use server'

import { TslotResponse, Tslot } from "@repo/ui/type"

/**
 * Fetches available appointment time slots for a given date and timezone.
 * 
 * @param iSelectedDate - The selected date for which slots are needed.
 * @param iTimezone - The user's timezone.
 * @returns A promise that resolves to TslotResponse, either with slot data or an error message.
 */
export async function fetchTimeSlots(iSelectedDate: string, iTimezone: string): Promise<TslotResponse> {
  try {
    // Validate required parameters
    if (!iSelectedDate || !iTimezone) {
      return { error: "Date and timezone are required." }
    }

    // Set request headers, including authorization and guest cookie info
    const ldHeaders = new Headers({
      Authorization: `${process.env.AUTH_BASE_64}`,
      "Content-Type": "application/json",
      Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
    })

    // Construct the API URL with date and timezone as query parameters
    const LSlotUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.get_appointment_slots?date=${iSelectedDate}&timezone=${iTimezone}`

    const LdResponse = await fetch(LSlotUrl, {
      method: "GET",
      headers: ldHeaders,
      redirect: "follow",
      cache: "no-store",
    })

     // If response is not successful, extract and return error message
    if (!LdResponse.ok) {
      const lErrorText = await LdResponse.text()
      return { error: lErrorText }
    }

    // Parse the response JSON
    const LdJson = await LdResponse.json()
    const LaSlots = LdJson?.message // Slot data expected in 'message' key

    // Validate that slots are returned as an array
    if (!Array.isArray(LaSlots)) {
      return { error: "Invalid slot format from API." }
    }

    // Return the slots with a success message
    return {
      message: "Slots fetched successfully",
      data: LaSlots as Tslot[],
    }
  } catch (error) {
    return { error: "Something went wrong while fetching slots." }
  }
}
