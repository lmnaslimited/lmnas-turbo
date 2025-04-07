'use server'

type Slot = {
  time: string
  availability: boolean
}

type SlotResponse = {
  message?: string
  data?: Slot[]
  error?: string
}

export async function fetchTimeSlots(selectedDate: string, timezone: string): Promise<SlotResponse> {
  try {
    if (!selectedDate || !timezone) {
      return { error: "Date and timezone are required." }
    }

    const headers = new Headers({
      "Authorization": `${process.env.AUTH_BASE_64}`,
      "Content-Type": "application/json",
      "Cookie": "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
    })

    const response = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.get_appointment_slots?date=${selectedDate}&timezone=${timezone}`,
      {
        method: "GET",
        headers,
        redirect: "follow",
        cache: "no-store",
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return { error }
    }

    const json = await response.json()

    // ✅ Extracting slots from message
    const slots = json?.message
    if (!Array.isArray(slots)) {
      return { error: "Invalid slot format from API." }
    }
    console.log(slots)
    return { message: "Slots fetched successfully", data: slots as Slot[] }
  } catch (err) {
    return { error: "Something went wrong while fetching slots." }
  }
}
