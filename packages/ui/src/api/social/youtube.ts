"use server"

import { TapiResponse } from "@repo/middleware/types"

export async function youTubeApi(): Promise<TapiResponse> {
  try {
    const LTimezoneUrl = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE}&channelId=${process.env.YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=20`

    const LdResponse = await fetch(LTimezoneUrl, {
      method: "GET",
      redirect: "follow",
    })

    if (!LdResponse.ok) {
      throw new Error("Failed to fetch youtube")
    }

    const LdJson = await LdResponse.json()
    const LaFormatData = LdJson.items.map((item: any) => ({
      id: item.id.videoId,
      publishedAt: item.snippet.publishedAt,
      title: item.snippet.title,
      description: item.snippet.description,
      author: item.snippet.channelTitle,
      source: "YouTube",
      media: {
        // url: `https://www.youtube.com/embed/${item.id.videoId}`,
        url: `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`,
        alt: item.snippet.title,
      },
    }))
    return {
      message: "youtube fetched successfully",
      data: LaFormatData,
    }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}
