"use server"

import { unstable_cache } from "next/cache"
import { TtrendCardProps } from "@repo/middleware/types"

// Defines the final output structure expected by consumers of this module
export interface ISocialApiPostIds {
  data: TtrendCardProps[]
}

// Minimal shape of raw post items returned by the LinkedIn Posts API
interface IPost {
  id: string
  publishedAt: number
  commentary?: string
  content?: {
    media?: {
      id?: string
      altText?: string
    }
    multiImage?: {
      images?: Array<{
        id?: string
        altText?: string
      }>
    }
    article?: {
      thumbnail?: string
      title?: string
    }
  }
}

// Structure of the response received when requesting a refreshed OAuth token
interface ILinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope?: string
}

// In-memory module storage for the active access token
let lCachedAccessToken: string | null = null

// Stores the exact timestamp when the token was created or last updated
let lTokenCreatedAt: number = 0

// Stores the validity lifespan of the token in seconds
let lTokenLifespanSeconds: number = 5184000

// Holds any updated refresh token returned dynamically during token exchange
let lDynamicRefreshToken: string | null = null

// Concurrency lock to prevent duplicate parallel token refresh requests (Object/Promise instance)
let ldTokenRefreshPromise: Promise<string> | null = null

// Wraps native fetch with an explicit timeout to prevent hanging connections
function fnFetchWithTimeout(
  iUrl: string,
  idOptions: RequestInit,
  iTimeout: number
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const ldTimer = setTimeout(
      () => reject(new Error("Request timed out")),
      iTimeout
    )

    fetch(iUrl, idOptions)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(ldTimer))
  })
}

// Retries failed HTTP requests a configurable number of times with an interval delay
async function fnRetryFetch(
  iUrl: string,
  idOptions: RequestInit,
  iRetries: number = 3,
  iDelay: number = 3000
): Promise<Response> {
  let ldLastError: unknown

  for (let lAttempt = 0; lAttempt < iRetries; lAttempt++) {
    try {
      return await fnFetchWithTimeout(iUrl, idOptions, 10000)
    } catch (ldError) {
      ldLastError = ldError
      if (lAttempt < iRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, iDelay))
      }
    }
  }

  if (ldLastError instanceof Error) {
    console.error("LinkedIn request failed:", ldLastError.message)
  }

  throw new Error("LinkedIn request failed after retries")
}

// Clears the cached credentials from memory so a fresh token will be requested
function fnInvalidateTokenCache(): void {
  console.warn("[AUTH CACHE] Invalidating cached access token due to auth failure.")
  lCachedAccessToken = null
  lTokenCreatedAt = 0
  lTokenLifespanSeconds = 0
}

// Utility to slice an array into smaller chunks
function fnChunkArray<T>(iaItems: T[], iChunkSize: number): T[][] {
  const laChunks: T[][] = []
  for (let lIndex = 0; lIndex < iaItems.length; lIndex += iChunkSize) {
    laChunks.push(iaItems.slice(lIndex, lIndex + iChunkSize))
  }
  return laChunks
}

// Retrieves a valid access token using elapsed time calculation and concurrency locking
async function fnGetLinkedInAccessToken(iForceRefresh: boolean = false): Promise<string> {
  const lNow = Date.now()
  const LBufferMs = 5 * 60 * 1000

  const lTimeElapsedMs = lNow - lTokenCreatedAt
  const lMaxAllowedLifespanMs = (lTokenLifespanSeconds * 1000) - LBufferMs

  if (!iForceRefresh && lCachedAccessToken && lTimeElapsedMs < lMaxAllowedLifespanMs) {
    return lCachedAccessToken
  }

  // Reuse existing in-flight token refresh promise if one is already running
  if (ldTokenRefreshPromise) {
    return ldTokenRefreshPromise
  }

  ldTokenRefreshPromise = (async () => {
    try {
      const lRefreshToken = lDynamicRefreshToken || process.env.LINKEDIN_REFRESH_TOKEN
      const lClientId = process.env.LINKEDIN_CLIENT_ID
      const lClientSecret = process.env.LINKEDIN_CLIENT_SECRET

      if (!lRefreshToken) throw new Error("LINKEDIN_REFRESH_TOKEN is not configured")
      if (!lClientId) throw new Error("LINKEDIN_CLIENT_ID is not configured")
      if (!lClientSecret) throw new Error("LINKEDIN_CLIENT_SECRET is not configured")

      const ldBody = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: lRefreshToken,
        client_id: lClientId,
        client_secret: lClientSecret,
      })

      const ldResponse = await fnRetryFetch(
        "https://www.linkedin.com/oauth/v2/accessToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: ldBody.toString(),
        }
      )

      if (!ldResponse.ok) {
        const lErrorText = await ldResponse.text()
        console.error("LinkedIn token refresh failed:", ldResponse.status, lErrorText)
        throw new Error(`LinkedIn token refresh failed: ${ldResponse.status}`)
      }

      const ldTokenData = (await ldResponse.json()) as ILinkedInTokenResponse

      if (!ldTokenData.access_token) {
        throw new Error("LinkedIn did not return an access token")
      }

      if (ldTokenData.refresh_token) {
        lDynamicRefreshToken = ldTokenData.refresh_token
      }

      lCachedAccessToken = ldTokenData.access_token
      lTokenCreatedAt = Date.now()
      lTokenLifespanSeconds = ldTokenData.expires_in ?? 5184000
      return lCachedAccessToken
    } finally {
      ldTokenRefreshPromise = null
    }
  })()

  return ldTokenRefreshPromise
}

// Constructs standard headers required for LinkedIn Restli versioned API requests
function fnGetLinkedInHeaders(iAccessToken: string): Headers {
  const lApiVersion = process.env.LINKEDIN_API_VERSION || "202603"
  return new Headers({
    "LinkedIn-Version": lApiVersion,
    "X-Restli-Protocol-Version": "2.0.0",
    Authorization: `Bearer ${iAccessToken}`,
  })
}

// Helper to extract media URN and alt text across single image, multi-image carousel, and article formats
function fnExtractMediaMetadata(idPost: IPost): { mediaId: string; altText: string } | null {
  // 1. Single direct image attachment
  if (idPost.content?.media?.id?.startsWith("urn:li:image:")) {
    return {
      mediaId: idPost.content.media.id,
      altText: idPost.content.media.altText || "LinkedIn Post Image",
    }
  }

  // 2. Multi-image carousel attachment (use first image)
  const ldCarouselImage = idPost.content?.multiImage?.images?.find((ldImg) =>
    ldImg.id?.startsWith("urn:li:image:")
  )
  if (ldCarouselImage?.id) {
    return {
      mediaId: ldCarouselImage.id,
      altText: ldCarouselImage.altText || "LinkedIn Post Image",
    }
  }

  // 3. Article thumbnail attachment
  if (idPost.content?.article?.thumbnail?.startsWith("urn:li:image:")) {
    return {
      mediaId: idPost.content.article.thumbnail,
      altText: idPost.content.article.title || "LinkedIn Post Article Thumbnail",
    }
  }

  return null
}

// Core retrieval function that fetches, filters, and formats organization posts
async function fnFetchLinkedInPostsInternal(): Promise<ISocialApiPostIds> {
  let lAccessToken = await fnGetLinkedInAccessToken()
  let ldHeaders = fnGetLinkedInHeaders(lAccessToken)

  const LOrgUrn = process.env.LINKEDIN_ORGANIZATION_URN || "urn:li:organization:67940092"
  const LPostsUrl =
    "https://api.linkedin.com/rest/posts" +
    `?author=${encodeURIComponent(LOrgUrn)}` +
    "&q=author" +
    "&count=20" +
    "&sortBy=LAST_MODIFIED"

  let ldResponse = await fnRetryFetch(LPostsUrl, {
    method: "GET",
    headers: ldHeaders,
    redirect: "follow",
  })

  // Auto-recovery fallback if 401 Unauthorized occurs
  if (ldResponse.status === 401) {
    console.warn("Received 401 Unauthorized from LinkedIn Posts API. Refreshing token & retrying...")
    fnInvalidateTokenCache()
    lAccessToken = await fnGetLinkedInAccessToken(true)
    ldHeaders = fnGetLinkedInHeaders(lAccessToken)

    ldResponse = await fnFetchWithTimeout(
      LPostsUrl,
      {
        method: "GET",
        headers: ldHeaders,
        redirect: "follow",
      },
      10000
    )
  }

  if (!ldResponse.ok) {
    const lErrorText = await ldResponse.text()
    console.error("LinkedIn posts API failed:", ldResponse.status, lErrorText)
    throw new Error(`LinkedIn posts API failed: ${ldResponse.status}`)
  }

  const ldLinkedIn = await ldResponse.json()

  // Guard against non-array payloads in elements property
  const laElements: IPost[] = Array.isArray(ldLinkedIn?.elements) ? ldLinkedIn.elements : []
  if (laElements.length === 0) {
    return { data: [] }
  }

  // Parse valid media items across single-image, carousel, and article formats
  const laPostsWithExtractedMedia: Array<{ post: IPost; mediaId: string; altText: string }> = []
  const laRawMediaIds: string[] = []

  laElements.forEach((ldPost: IPost) => {
    const ldExtracted = fnExtractMediaMetadata(ldPost)
    if (ldExtracted) {
      laPostsWithExtractedMedia.push({
        post: ldPost,
        mediaId: ldExtracted.mediaId,
        altText: ldExtracted.altText,
      })
      laRawMediaIds.push(ldExtracted.mediaId)
    }
  })

  if (laRawMediaIds.length === 0) {
    return { data: [] }
  }

  // Remove duplicate media IDs
  const laUniqueMediaIds = Array.from(new Set(laRawMediaIds))

  // Chunk image IDs into groups of 10 to prevent URL length overflow
  const laImageIdChunks = fnChunkArray(laUniqueMediaIds, 10)
  const ldResolvedImagesMap: Record<string, { downloadUrl?: string }> = {}

  for (const laChunk of laImageIdChunks) {
    const laEncodedUrns = laChunk.map((lUrn) => encodeURIComponent(lUrn))
    const lIdsParam = `List(${laEncodedUrns.join(",")})`
    const LImageUrl = `https://api.linkedin.com/rest/images?ids=${lIdsParam}`

    let ldImageResponse = await fnRetryFetch(LImageUrl, {
      method: "GET",
      headers: ldHeaders,
      redirect: "follow",
    })

    if (ldImageResponse.status === 401) {
      fnInvalidateTokenCache()
      lAccessToken = await fnGetLinkedInAccessToken(true)
      ldHeaders = fnGetLinkedInHeaders(lAccessToken)
      ldImageResponse = await fnFetchWithTimeout(
        LImageUrl,
        {
          method: "GET",
          headers: ldHeaders,
          redirect: "follow",
        },
        10000
      )
    }

    if (!ldImageResponse.ok) {
      const lErrorText = await ldImageResponse.text()
      console.error("LinkedIn image batch failed:", ldImageResponse.status, lErrorText)
      throw new Error(`LinkedIn image batch API failed: ${ldImageResponse.status}`)
    }

    const ldImageData = await ldImageResponse.json()
    if (ldImageData?.results) {
      Object.assign(ldResolvedImagesMap, ldImageData.results)
    }
  }

  // Format valid posts into standard UI card structures
  const laFormattedPosts: TtrendCardProps[] = laPostsWithExtractedMedia.reduce<TtrendCardProps[]>(
    (laAcc, { post, mediaId, altText }) => {
      const ldImage = ldResolvedImagesMap[mediaId]
      const lImageUrl = ldImage?.downloadUrl || null
      const lCommentary = post.commentary?.trim() || ""

      // Skip cards where the image download URL could not be resolved
      if (!lImageUrl) return laAcc

      laAcc.push({
        id: post.id,
        title: "",
        publishedAt: new Date(post.publishedAt).toISOString(),
        description: lCommentary,
        media: {
          url: lImageUrl,
          alt: altText,
        },
        source: "LinkedIn",
        author: process.env.LINKEDIN_AUTHOR_NAME || "LMNAs Cloud Solutions",
      })

      return laAcc
    },
    []
  )

  return {
    data: laFormattedPosts,
  }
}

// Caches the formatted posts array using Next.js cache and revalidates once every hour
export const LLinkedInApi = unstable_cache(
  async () => {
    return await fnFetchLinkedInPostsInternal()
  },
  ["linkedin-org-posts-cache"],
  {
    revalidate: 3600,
    tags: ["linkedin-posts"],
  }
)