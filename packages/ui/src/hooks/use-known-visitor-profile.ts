"use client"

import { useEffect, useState } from "react"
import posthog from "posthog-js"

type TknownVisitorProfile = {
  email?: string
  name?: string
  phone?: string
}

type TknownVisitorState = {
  Profile: TknownVisitorProfile
  IsReady: boolean
}

function fnReadStringProperty(
  idProperties: Record<string, unknown>,
  iPropertyName: string,
): string | undefined {
  const LValue = idProperties[iPropertyName]
  if (typeof LValue !== "string") return undefined

  const LTrimmedValue = LValue.trim()
  return LTrimmedValue || undefined
}

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

export function useKnownVisitorProfile(): TknownVisitorState {
  const [Profile, fnSetProfile] = useState<TknownVisitorProfile>({})
  const [IsReady, fnSetIsReady] = useState(false)

  useEffect(() => {
    const fnSyncProfile = () => {
      fnSetProfile(fnReadProfile())
      fnSetIsReady(true)
    }

    if (document.documentElement.dataset.posthogReady === "true") {
      fnSyncProfile()
    }

    window.addEventListener("posthog-ready", fnSyncProfile)
    window.addEventListener("posthog-user-updated", fnSyncProfile)

    return () => {
      window.removeEventListener("posthog-ready", fnSyncProfile)
      window.removeEventListener("posthog-user-updated", fnSyncProfile)
    }
  }, [])

  return { Profile, IsReady }
}
