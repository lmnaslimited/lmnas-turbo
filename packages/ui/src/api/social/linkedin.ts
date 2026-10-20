"use server"

import { unstable_cache } from "next/cache"
import { TtrendCardProps } from "@repo/middleware/types"

// Defines the final output structure expected by consumers of this module
export type TSocialAPIPostIds = {
  data: TtrendCardProps[]
}

// Minimal shape of raw post items returned by the LinkedIn Posts API
type TPost = {
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
type TLinkedInTokenResponse = {
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

// Concurrency lock to prevent duplicate parallel token refresh requests
let lTokenRefreshPromise: Promise<string> | null = null

// Wraps native fetch with an explicit timeout to prevent hanging connections
function fnFetchWithTimeout(
  iUrl: string,
  idOptions: RequestInit,
  iTimeout: number
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const LTimer = setTimeout(
      () => reject(new Error("Request timed out")),
      iTimeout
    )

    fetch(iUrl, idOptions)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(LTimer))
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
    } catch (error) {
      ldLastError = error
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
  const LNow = Date.now()
  const LBufferMs = 5 * 60 * 1000

  const LTimeElapsedMs = LNow - lTokenCreatedAt
  const LMaxAllowedLifespanMs = (lTokenLifespanSeconds * 1000) - LBufferMs

  if (!iForceRefresh && lCachedAccessToken && LTimeElapsedMs < LMaxAllowedLifespanMs) {
    const LRemainingSeconds = Math.round((LMaxAllowedLifespanMs - LTimeElapsedMs) / 1000)
    return lCachedAccessToken
  }

  // Reuse existing in-flight token refresh promise if one is already running
  if (lTokenRefreshPromise) {
    return lTokenRefreshPromise
  }

  lTokenRefreshPromise = (async () => {
    try {
      const LRefreshToken = lDynamicRefreshToken || process.env.LINKEDIN_REFRESH_TOKEN
      const LClientId = process.env.LINKEDIN_CLIENT_ID
      const LClientSecret = process.env.LINKEDIN_CLIENT_SECRET

      if (!LRefreshToken) throw new Error("LINKEDIN_REFRESH_TOKEN is not configured")
      if (!LClientId) throw new Error("LINKEDIN_CLIENT_ID is not configured")
      if (!LClientSecret) throw new Error("LINKEDIN_CLIENT_SECRET is not configured")

      const LdBody = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: LRefreshToken,
        client_id: LClientId,
        client_secret: LClientSecret,
      })

      const LdResponse = await fnRetryFetch(
        "https://www.linkedin.com/oauth/v2/accessToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: LdBody.toString(),
        }
      )

      if (!LdResponse.ok) {
        const LErrorText = await LdResponse.text()
        console.error("LinkedIn token refresh failed:", LdResponse.status, LErrorText)
        throw new Error(`LinkedIn token refresh failed: ${LdResponse.status}`)
      }

      const LdTokenData = (await LdResponse.json()) as TLinkedInTokenResponse

      if (!LdTokenData.access_token) {
        throw new Error("LinkedIn did not return an access token")
      }

      if (LdTokenData.refresh_token) {
        lDynamicRefreshToken = LdTokenData.refresh_token
      }

      lCachedAccessToken = LdTokenData.access_token
      lTokenCreatedAt = Date.now()
      lTokenLifespanSeconds = LdTokenData.expires_in ?? 5184000
      return lCachedAccessToken
    } finally {
      lTokenRefreshPromise = null
    }
  })()

  return lTokenRefreshPromise
}

// Constructs standard headers required for LinkedIn Restli versioned API requests
function fnGetLinkedInHeaders(iAccessToken: string): Headers {
  const LApiVersion = process.env.LINKEDIN_API_VERSION || "202603"
  return new Headers({
    "LinkedIn-Version": LApiVersion,
    "X-Restli-Protocol-Version": "2.0.0",
    Authorization: `Bearer ${iAccessToken}`,
  })
}

// Helper to extract media URN and alt text across single image, multi-image carousel, and article formats
function fnExtractMediaMetadata(idPost: TPost): { mediaId: string; altText: string } | null {
  // 1. Single direct image attachment
  if (idPost.content?.media?.id?.startsWith("urn:li:image:")) {
    return {
      mediaId: idPost.content.media.id,
      altText: idPost.content.media.altText || "LinkedIn Post Image",
    }
  }

  // 2. Multi-image carousel attachment (use first image)
  const LdCarouselImage = idPost.content?.multiImage?.images?.find((idImg) =>
    idImg.id?.startsWith("urn:li:image:")
  )
  if (LdCarouselImage?.id) {
    return {
      mediaId: LdCarouselImage.id,
      altText: LdCarouselImage.altText || "LinkedIn Post Image",
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
async function fnFetchLinkedInPostsInternal(): Promise<TSocialAPIPostIds> {
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

    ldResponse = await fnFetchWithTimeout(LPostsUrl, {
      method: "GET",
      headers: ldHeaders,
      redirect: "follow",
    }, 10000)
  }

  if (!ldResponse.ok) {
    const LErrorText = await ldResponse.text()
    console.error("LinkedIn posts API failed:", ldResponse.status, LErrorText)
    throw new Error(`LinkedIn posts API failed: ${ldResponse.status}`)
  }

  const LdLinkedIn = await ldResponse.json()

  // Guard against non-array payloads in elements property
  const LaElements: TPost[] = Array.isArray(LdLinkedIn?.elements) ? LdLinkedIn.elements : []
  if (LaElements.length === 0) {
    return { data: [] }
  }

  // Parse valid media items across single-image, carousel, and article formats
  const LaPostsWithExtractedMedia: Array<{ post: TPost; mediaId: string; altText: string }> = []
  const LaRawMediaIds: string[] = []

  LaElements.forEach((ldPost: TPost) => {
    const LdExtracted = fnExtractMediaMetadata(ldPost)
    if (LdExtracted) {
      LaPostsWithExtractedMedia.push({
        post: ldPost,
        mediaId: LdExtracted.mediaId,
        altText: LdExtracted.altText,
      })
      LaRawMediaIds.push(LdExtracted.mediaId)
    }
  })

  if (LaRawMediaIds.length === 0) {
    return { data: [] }
  }

  // Remove duplicate media IDs
  const LaUniqueMediaIds = Array.from(new Set(LaRawMediaIds))

  // Chunk image IDs into groups of 10 to prevent URL length overflow
  const LaImageIdChunks = fnChunkArray(LaUniqueMediaIds, 10)
  const LdResolvedImagesMap: Record<string, { downloadUrl?: string }> = {}

  for (const LaChunk of LaImageIdChunks) {
    const LaEncodedUrns = LaChunk.map((lUrn) => encodeURIComponent(lUrn))
    const LIdsParam = `List(${LaEncodedUrns.join(",")})`
    const LImageUrl = `https://api.linkedin.com/rest/images?ids=${LIdsParam}`

    let ldImageResponse = await fnRetryFetch(LImageUrl, {
      method: "GET",
      headers: ldHeaders,
      redirect: "follow",
    })

    if (ldImageResponse.status === 401) {
      fnInvalidateTokenCache()
      lAccessToken = await fnGetLinkedInAccessToken(true)
      ldHeaders = fnGetLinkedInHeaders(lAccessToken)
      ldImageResponse = await fnFetchWithTimeout(LImageUrl, {
        method: "GET",
        headers: ldHeaders,
        redirect: "follow",
      }, 10000)
    }

    if (!ldImageResponse.ok) {
      const LErrorText = await ldImageResponse.text()
      console.error("LinkedIn image batch failed:", ldImageResponse.status, LErrorText)
      throw new Error(`LinkedIn image batch API failed: ${ldImageResponse.status}`)
    }

    const LdImageData = await ldImageResponse.json()
    if (LdImageData?.results) {
      Object.assign(LdResolvedImagesMap, LdImageData.results)
    }
  }

  // Format valid posts into standard UI card structures
  const LaFormattedPosts: TtrendCardProps[] = LaPostsWithExtractedMedia.reduce<TtrendCardProps[]>(
    (laAcc, { post, mediaId, altText }) => {
      const LdImage = LdResolvedImagesMap[mediaId]
      const LImageUrl = LdImage?.downloadUrl || null
      const LCommentary = post.commentary?.trim() || ""

      // Skip cards where the image download URL could not be resolved
      if (!LImageUrl) return laAcc

      laAcc.push({
        id: post.id,
        title: "",
        publishedAt: new Date(post.publishedAt).toISOString(),
        description: LCommentary,
        media: {
          url: LImageUrl,
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
    data: LaFormattedPosts,
  }
}

// Caches the formatted posts array using Next.js cache and revalidates once every hour
export const LinkedInApi = unstable_cache(
  async () => {
    return await fnFetchLinkedInPostsInternal()
  },
  ["linkedin-org-posts-cache"],
  {
    revalidate: 3600,
    tags: ["linkedin-posts"],
  }
)