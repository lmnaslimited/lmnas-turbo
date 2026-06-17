"use client"

import { useEffect, useState } from "react"
import { getCountriesForTimezone } from "countries-and-timezones"

/**
 * Region inferred from the visitor's browser, used to pre-fill the phone
 * country code and (when present) the timezone field. Both values are empty
 * until the effect runs on the client, so server render and hydration match.
 */
export type TdetectedRegion = {
  // IANA timezone, e.g. "Asia/Kolkata" — matches a timezone select option value.
  timezone?: string
  // Lowercased ISO-3166 alpha-2, e.g. "in" — the shape react-international-phone expects.
  countryIso?: string
}

/**
 * Detects the visitor's timezone and country purely on the client.
 *
 * `Intl.DateTimeFormat().resolvedOptions().timeZone` is read in an effect (not
 * during render) so the server-rendered markup — which would otherwise see the
 * server's timezone — stays consistent with the first client render. Detection
 * is best-effort: on any failure the values stay undefined and callers fall
 * back to their defaults.
 */
export function useDetectedRegion(): TdetectedRegion {
  const [LdRegion, fnSetRegion] = useState<TdetectedRegion>({})

  useEffect(() => {
    try {
      const LTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      console.log("Detected timezone:", LTimezone)
      if (!LTimezone) return

      // Shared timezones resolve to multiple countries; the package orders them
      // by relevance, so the first entry is the most statistically likely.
      const LaCountries = getCountriesForTimezone(LTimezone)
      const LCountryIso = LaCountries?.[0]?.id?.toLowerCase()
      console.log("Inferred country from timezone:", LCountryIso)

      fnSetRegion({ timezone: LTimezone, countryIso: LCountryIso })
    } catch {
      // Best-effort only — leave defaults in place.
    }
  }, [])

  return LdRegion
}

export default useDetectedRegion
