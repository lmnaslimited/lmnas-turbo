"use server"

type TFrappeDoctype = "Contact" | "Lead"

const fnNormalizePostHogDistinctId = (iEmail?: unknown) => {
  if (typeof iEmail !== "string") return null

  const LEmail = iEmail.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(LEmail) ? LEmail : null
}

const fnGetCrmConfig = () => {
  const LBaseUrl = process.env.SUBSCRIBE_URL
  const LAuthorizationHeader = process.env.AUTH_BASE_64

  if (!LBaseUrl || !LAuthorizationHeader) {
    return null
  }

  return {
    baseUrl: LBaseUrl,
    headers: {
      Authorization: LAuthorizationHeader,
      "Content-Type": "application/json",
      Cookie:
        "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
    },
  }
}

export async function linkFrappeRecordToPostHog(
  iDoctype: TFrappeDoctype,
  iRecordName: unknown,
  iEmail: unknown,
) {
  const LDistinctId = fnNormalizePostHogDistinctId(iEmail)
  const LRecordName = typeof iRecordName === "string" ? iRecordName : null
  const LConfig = fnGetCrmConfig()

  if (!LDistinctId || !LRecordName || !LConfig) return

  try {
    const LdResponse = await fetch(
      `${LConfig.baseUrl}/api/resource/${iDoctype}/${encodeURIComponent(LRecordName)}`,
      {
        method: "PUT",
        headers: LConfig.headers,
        body: JSON.stringify({ custom_posthog_distinct_id: LDistinctId }),
      },
    )

    if (!LdResponse.ok) {
      console.error(
        `PostHog CRM link failed for ${iDoctype} ${LRecordName}:`,
        await LdResponse.text(),
      )
    }
  } catch (iError) {
    console.error(`PostHog CRM link failed for ${iDoctype}:`, iError)
  }
}

export async function linkFrappeRecordByEmailToPostHog(iEmail: unknown) {
  const LDistinctId = fnNormalizePostHogDistinctId(iEmail)
  const LConfig = fnGetCrmConfig()

  if (!LDistinctId || !LConfig) return

  for (const LDoctype of ["Contact", "Lead"] as const) {
    try {
      const LEmailField = LDoctype === "Contact" ? "email_id" : "email_id"
      const LdLookupResponse = await fetch(
        `${LConfig.baseUrl}/api/resource/${LDoctype}?fields=["name"]&filters=[["${LEmailField}","=","${LDistinctId}"]]`,
        {
          method: "GET",
          headers: LConfig.headers,
        },
      )

      if (!LdLookupResponse.ok) {
        console.error(
          `PostHog CRM lookup failed for ${LDoctype}:`,
          await LdLookupResponse.text(),
        )
        continue
      }

      const LdLookupResult = await LdLookupResponse.json()
      const LRecordName = LdLookupResult?.data?.[0]?.name

      if (LRecordName) {
        await linkFrappeRecordToPostHog(LDoctype, LRecordName, LDistinctId)
        return
      }
    } catch (iError) {
      console.error(`PostHog CRM lookup failed for ${LDoctype}:`, iError)
    }
  }
}
