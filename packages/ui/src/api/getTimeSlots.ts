'use server'

import { TslotResponse, Tslot } from "@repo/ui/type"

export async function fetchTimeSlots(iSelectedDate: string, iTimezone: string): Promise<TslotResponse> {
  try {
    if (!iSelectedDate || !iTimezone) {
      return { error: "Date and timezone are required." }
    }

    const ldHeaders = new Headers({
      Authorization: `${process.env.AUTH_BASE_64}`,
      "Content-Type": "application/json",
      Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
    })

    const LSlotUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.get_appointment_slots?date=${iSelectedDate}&timezone=${iTimezone}`

    const LdResponse = await fetch(LSlotUrl, {
      method: "GET",
      headers: ldHeaders,
      redirect: "follow",
      cache: "no-store",
    })

    if (!LdResponse.ok) {
      const lErrorText = await LdResponse.text()
      return { error: lErrorText }
    }

    const LdJson = await LdResponse.json()
    const LaSlots = LdJson?.message

    if (!Array.isArray(LaSlots)) {
      return { error: "Invalid slot format from API." }
    }

    return {
      message: "Slots fetched successfully",
      data: LaSlots as Tslot[],
    }
  } catch (error) {
    return { error: "Something went wrong while fetching slots." }
  }
}
