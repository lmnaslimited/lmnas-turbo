'use server'

import { TapiResponse } from "@repo/ui/type"

export async function youTubeApi(): Promise<TapiResponse> {

  try {
    const LTimezoneUrl = "https://www.googleapis.com/youtube/v3/search?key=&channelId=UCq5S8zxFv7e0bd23nq_hpWg&part=snippet,id&order=date&maxResults=20"

    const LdResponse = await fetch(LTimezoneUrl, {
      method: "GET",
      redirect: "follow",
    })

    if (!LdResponse.ok) {
        console.log(LdResponse)
      throw new Error("Failed to fetch youtube")
    }

    const LdJson = await LdResponse.json()
    console.log(LdJson)
    return {
      message: "youtube fetched successfully",
      data: LdJson,
    }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}