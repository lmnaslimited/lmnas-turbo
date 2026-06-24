"use client"

import { useEffect, useState } from "react"
import posthog from "posthog-js"

// Profile data stored in PostHog person properties
type TknownVisitorProfile = {
  email?: string
  name?: string
  phone?: string
}

// Hook return type
type TknownVisitorState = {
  Profile: TknownVisitorProfile
  IsReady: boolean
}

/**
 * Safely read a string property from an object.
 * Returns undefined if the value is missing, not a string,
 * or an empty string after trimming.
 */
function fnReadStringProperty(
  idProperties: Record<string, unknown>,
  iPropertyName: string,
): string | undefined {
  const LValue = idProperties[iPropertyName]
  if (typeof LValue !== "string") return undefined

  const LTrimmedValue = LValue.trim()
  return LTrimmedValue || undefined
}

//get the known profile which is stored in posthog
function fnReadProfile(): TknownVisitorProfile {
  const LStoredProperties = posthog.get_property("$stored_person_properties")

  if (
    !LStoredProperties ||
    typeof LStoredProperties !== "object" ||
    Array.isArray(LStoredProperties)
  ) {
    return {}
  }

  const LdProperties = LStoredProperties as Record<string, unknown>

  return {
    email: fnReadStringProperty(LdProperties, "email"),
    name: fnReadStringProperty(LdProperties, "name"),
    phone: fnReadStringProperty(LdProperties, "phone"),
  }
}

/**
 * Hook to retrieve a known visitor profile from PostHog.
 *
 * Listens for:
 * - posthog-ready: Fired when PostHog is initialized
 * - posthog-user-updated: Fired when person properties change
 *
 * Returns:
 * - Profile: Known visitor details
 * - IsReady: Indicates whether initial profile loading is complete
 */
export function useKnownVisitorProfile(): TknownVisitorState {
  const [Profile, fnSetProfile] = useState<TknownVisitorProfile>({})
  const [IsReady, fnSetIsReady] = useState(false)

  useEffect(() => {
        /**
     * Sync profile data from PostHog into React state.
     */
    const fnSyncProfile = () => {
      fnSetProfile(fnReadProfile())
      fnSetIsReady(true)
    }

    // If PostHog is already initialized, load profile immediately
    if (document.documentElement.dataset.posthogReady === "true") {
      fnSyncProfile()
    }

    // Listen for PostHog lifecycle events
    window.addEventListener("posthog-ready", fnSyncProfile)
    window.addEventListener("posthog-user-updated", fnSyncProfile)

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("posthog-ready", fnSyncProfile)
      window.removeEventListener("posthog-user-updated", fnSyncProfile)
    }
  }, [])

  return { Profile, IsReady }
}
