"use server"

import type {
  TappointmentAvailabilityResponse,
  TappointmentSettings,
  Tslot,
} from "@repo/middleware/types"
import { fetchTimeSlots } from "./fetch-timeslot"

const AVAILABILITY_REQUEST_BATCH_SIZE = 7

function fnDateInTimezone(iTimezone: string): string {
  const LaParts = new Intl.DateTimeFormat("en-US", {
    timeZone: iTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const LdParts = Object.fromEntries(
    LaParts.map((idPart) => [idPart.type, idPart.value]),
  )

  return `${LdParts.year}-${LdParts.month}-${LdParts.day}`
}

function fnAddDays(iDate: string, iDays: number): string {
  const [LYear = 0, LMonth = 1, LDay = 1] = iDate
    .split("-")
    .map(Number)
  const LDate = new Date(Date.UTC(LYear, LMonth - 1, LDay))
  LDate.setUTCDate(LDate.getUTCDate() + iDays)
  return LDate.toISOString().slice(0, 10)
}

async function fnFetchAppointmentSettings(): Promise<TappointmentSettings> {
  const LdHeaders = new Headers({
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
  })
  const LSettingsUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.get_appointment_settings`
  const LdResponse = await fetch(LSettingsUrl, {
    method: "GET",
    headers: LdHeaders,
    redirect: "follow",
    cache: "no-store",
  })

  if (!LdResponse.ok) {
    throw new Error(await LdResponse.text())
  }

  const LdJson = await LdResponse.json()
  const LdSettings = LdJson?.message as Partial<TappointmentSettings> | undefined

  if (
    !LdSettings ||
    typeof LdSettings.advance_booking_days !== "number" ||
    typeof LdSettings.appointment_duration !== "number"
  ) {
    throw new Error("Invalid appointment settings from ERPNext.")
  }
  return LdSettings as TappointmentSettings
}

export async function fetchAppointmentAvailability(
  iTimezone: string,
): Promise<TappointmentAvailabilityResponse> {
  if (!iTimezone) return { error: "Timezone is required." }

  try {
    const LdSettings = await fnFetchAppointmentSettings()
    const LRangeStart = fnDateInTimezone(iTimezone)
    const LAdvanceDays = Math.max(0, Math.floor(LdSettings.advance_booking_days))
    const LRangeEnd = fnAddDays(LRangeStart, LAdvanceDays)
    const LaDates = Array.from(
      { length: LAdvanceDays + 1 },
      (_, iIndex) => fnAddDays(LRangeStart, iIndex),
    )
    const LdSlotsByDate: Record<string, Tslot[]> = {}
    const LaAvailableDates: string[] = []

    for (
      let LIndex = 0;
      LIndex < LaDates.length;
      LIndex += AVAILABILITY_REQUEST_BATCH_SIZE
    ) {
      const LaBatch = LaDates.slice(
        LIndex,
        LIndex + AVAILABILITY_REQUEST_BATCH_SIZE,
      )
      const LaResults = await Promise.all(
        LaBatch.map(async (LDate) => ({
          date: LDate,
          result: await fetchTimeSlots(LDate, iTimezone),
        })),
      )

      LaResults.forEach(({ date: LDate, result: LdResult }) => {
        const LaSlots = Array.isArray(LdResult.data) ? LdResult.data : []
        LdSlotsByDate[LDate] = LaSlots
        if (LaSlots.some((idSlot) => idSlot.availability)) {
          LaAvailableDates.push(LDate)
        }
      })
    }
    return {
      data: {
        settings: LdSettings,
        rangeStart: LRangeStart,
        rangeEnd: LRangeEnd,
        availableDates: LaAvailableDates,
        slotsByDate: LdSlotsByDate,
      },
    }
  } catch (error) {
    console.error("Failed to load appointment availability:", error)
    return { error: "Unable to load appointment availability." }
  }
}
