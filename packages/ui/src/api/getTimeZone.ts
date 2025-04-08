'use server'

import { TapiResponse } from "@repo/ui/type"

export async function fetchTimezones(): Promise<TapiResponse> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const ldHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie: "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  }

  try {
    const LTimezoneUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.get_timezones`

    const LdResponse = await fetch(LTimezoneUrl, {
      method: "GET",
      headers: ldHeaders,
      redirect: "follow",
    })

    if (!LdResponse.ok) {
      throw new Error("Failed to fetch timezones")
    }

    const LdJson = await LdResponse.json()

    return {
      message: "Timezones fetched successfully",
      data: LdJson.message,
    }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}
