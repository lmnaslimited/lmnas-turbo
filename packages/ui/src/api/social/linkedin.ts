"use server"

import { unstable_cache } from "next/cache"
import { TtrendCardProps } from "@repo/middleware/types"

// Defines the final output structure expected by consumers of this module
export type TsocialAPIPostIds = {
  data: TtrendCardProps[]
}

// Minimal shape of raw post items returned by the LinkedIn Posts API
type Tpost = {
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
let cachedAccessToken: string | null = null

// Stores the exact timestamp when the token was created or last updated
let tokenCreatedAt: number = 0

// Stores the validity lifespan of the token in seconds
let tokenLifespanSeconds: number = 5184000

// Holds any updated refresh token returned dynamically during token exchange
let dynamicRefreshToken: string | null = null

// Concurrency lock to prevent duplicate parallel token refresh requests
let tokenRefreshPromise: Promise<string> | null = null

// Wraps native fetch with an explicit timeout to prevent hanging connections
function fnFetchWithTimeout(
  iUrl: string,
  idOptions: RequestInit,
  iTimeout: number
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const LdTimer = setTimeout(
      () => reject(new Error("Request timed out")),
      iTimeout
    )

    fetch(iUrl, idOptions)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(LdTimer))
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
  cachedAccessToken = null
  tokenCreatedAt = 0
  tokenLifespanSeconds = 0
}

// Utility to slice an array into smaller chunks
function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

// Retrieves a valid access token using elapsed time calculation and concurrency locking
async function fnGetLinkedInAccessToken(forceRefresh: boolean = false): Promise<string> {
  const now = Date.now()
  const BUFFER_MS = 5 * 60 * 1000

  const timeElapsedMs = now - tokenCreatedAt
  const maxAllowedLifespanMs = (tokenLifespanSeconds * 1000) - BUFFER_MS

  if (!forceRefresh && cachedAccessToken && timeElapsedMs < maxAllowedLifespanMs) {
    const remainingSeconds = Math.round((maxAllowedLifespanMs - timeElapsedMs) / 1000)
    return cachedAccessToken
  }

  // Reuse existing in-flight token refresh promise if one is already running
  if (tokenRefreshPromise) {
    return tokenRefreshPromise
  }

  tokenRefreshPromise = (async () => {
    try {

      const LdRefreshToken = dynamicRefreshToken || process.env.LINKEDIN_REFRESH_TOKEN
      const LdClientId = process.env.LINKEDIN_CLIENT_ID
      const LdClientSecret = process.env.LINKEDIN_CLIENT_SECRET

      if (!LdRefreshToken) throw new Error("LINKEDIN_REFRESH_TOKEN is not configured")
      if (!LdClientId) throw new Error("LINKEDIN_CLIENT_ID is not configured")
      if (!LdClientSecret) throw new Error("LINKEDIN_CLIENT_SECRET is not configured")

      const LdBody = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: LdRefreshToken,
        client_id: LdClientId,
        client_secret: LdClientSecret,
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
        const LdErrorText = await LdResponse.text()
        console.error("LinkedIn token refresh failed:", LdResponse.status, LdErrorText)
        throw new Error(`LinkedIn token refresh failed: ${LdResponse.status}`)
      }

      const LdTokenData = (await LdResponse.json()) as TLinkedInTokenResponse

      if (!LdTokenData.access_token) {
        throw new Error("LinkedIn did not return an access token")
      }

      if (LdTokenData.refresh_token) {
        dynamicRefreshToken = LdTokenData.refresh_token
      }

      cachedAccessToken = LdTokenData.access_token
      tokenCreatedAt = Date.now()
      tokenLifespanSeconds = LdTokenData.expires_in ?? 5184000
      return cachedAccessToken
    } finally {
      // Clear the promise lock once resolved or rejected
      tokenRefreshPromise = null
    }
  })()

  return tokenRefreshPromise
}

// Constructs standard headers required for LinkedIn Restli versioned API requests
function fnGetLinkedInHeaders(iAccessToken: string): Headers {
  const apiVersion = process.env.LINKEDIN_API_VERSION || "202603"
  return new Headers({
    "LinkedIn-Version": apiVersion,
    "X-Restli-Protocol-Version": "2.0.0",
    Authorization: `Bearer ${iAccessToken}`,
  })
}

// Helper to extract media URN and alt text across single image, multi-image carousel, and article formats
function extractMediaMetadata(post: Tpost): { mediaId: string; altText: string } | null {
  // 1. Single direct image attachment
  if (post.content?.media?.id?.startsWith("urn:li:image:")) {
    return {
      mediaId: post.content.media.id,
      altText: post.content.media.altText || "LinkedIn Post Image",
    }
  }

  // 2. Multi-image carousel attachment (use first image)
  const carouselImage = post.content?.multiImage?.images?.find((img) =>
    img.id?.startsWith("urn:li:image:")
  )
  if (carouselImage?.id) {
    return {
      mediaId: carouselImage.id,
      altText: carouselImage.altText || "LinkedIn Post Image",
    }
  }

  // 3. Article thumbnail attachment
  if (post.content?.article?.thumbnail?.startsWith("urn:li:image:")) {
    return {
      mediaId: post.content.article.thumbnail,
      altText: post.content.article.title || "LinkedIn Post Article Thumbnail",
    }
  }

  return null
}

// Core retrieval function that fetches, filters, and formats organization posts
async function fetchLinkedInPostsInternal(): Promise<TsocialAPIPostIds> {
  let LdAccessToken = await fnGetLinkedInAccessToken()
  let LdHeaders = fnGetLinkedInHeaders(LdAccessToken)

  const orgUrn = process.env.LINKEDIN_ORGANIZATION_URN || "urn:li:organization:67940092"
  const LdPostsUrl =
    "https://api.linkedin.com/rest/posts" +
    `?author=${encodeURIComponent(orgUrn)}` +
    "&q=author" +
    "&count=20" +
    "&sortBy=LAST_MODIFIED"

  let LdResponse = await fnRetryFetch(LdPostsUrl, {
    method: "GET",
    headers: LdHeaders,
    redirect: "follow",
  })

  // Auto-recovery fallback if 401 Unauthorized occurs
  if (LdResponse.status === 401) {
    console.warn("Received 401 Unauthorized from LinkedIn Posts API. Refreshing token & retrying...")
    fnInvalidateTokenCache()
    LdAccessToken = await fnGetLinkedInAccessToken(true)
    LdHeaders = fnGetLinkedInHeaders(LdAccessToken)

    LdResponse = await fnFetchWithTimeout(LdPostsUrl, {
      method: "GET",
      headers: LdHeaders,
      redirect: "follow",
    }, 10000)
  }

  if (!LdResponse.ok) {
    const LdErrorText = await LdResponse.text()
    console.error("LinkedIn posts API failed:", LdResponse.status, LdErrorText)
    throw new Error(`LinkedIn posts API failed: ${LdResponse.status}`)
  }

  const LdLinkedIn = await LdResponse.json()

  // Guard against non-array payloads in elements property
  const elements = Array.isArray(LdLinkedIn?.elements) ? LdLinkedIn.elements : []
  if (elements.length === 0) {
    return { data: [] }
  }

  // Parse valid media items across single-image, carousel, and article formats
  const postsWithExtractedMedia: Array<{ post: Tpost; mediaId: string; altText: string }> = []
  const rawMediaIds: string[] = []

  elements.forEach((post: Tpost) => {
    const extracted = extractMediaMetadata(post)
    if (extracted) {
      postsWithExtractedMedia.push({
        post,
        mediaId: extracted.mediaId,
        altText: extracted.altText,
      })
      rawMediaIds.push(extracted.mediaId)
    }
  })

  if (rawMediaIds.length === 0) {
    return { data: [] }
  }

  // Remove duplicate media IDs
  const uniqueMediaIds = Array.from(new Set(rawMediaIds))

  // Chunk image IDs into groups of 10 to prevent URL length overflow
  const imageIdChunks = chunkArray(uniqueMediaIds, 10)
  const resolvedImagesMap: Record<string, { downloadUrl?: string }> = {}

  for (const chunk of imageIdChunks) {
    const LencodedUrns = chunk.map((LdUrn) => encodeURIComponent(LdUrn))
    const LidsParam = `List(${LencodedUrns.join(",")})`
    const LdImageUrl = `https://api.linkedin.com/rest/images?ids=${LidsParam}`

    let LdImageResponse = await fnRetryFetch(LdImageUrl, {
      method: "GET",
      headers: LdHeaders,
      redirect: "follow",
    })

    if (LdImageResponse.status === 401) {
      fnInvalidateTokenCache()
      LdAccessToken = await fnGetLinkedInAccessToken(true)
      LdHeaders = fnGetLinkedInHeaders(LdAccessToken)
      LdImageResponse = await fnFetchWithTimeout(LdImageUrl, {
        method: "GET",
        headers: LdHeaders,
        redirect: "follow",
      }, 10000)
    }

    if (!LdImageResponse.ok) {
      const LdErrorText = await LdImageResponse.text()
      console.error("LinkedIn image batch failed:", LdImageResponse.status, LdErrorText)
      throw new Error(`LinkedIn image batch API failed: ${LdImageResponse.status}`)
    }

    const LdImageData = await LdImageResponse.json()
    if (LdImageData?.results) {
      Object.assign(resolvedImagesMap, LdImageData.results)
    }
  }

  // Format valid posts into standard UI card structures
  const LdFormattedPosts: TtrendCardProps[] = postsWithExtractedMedia.reduce<TtrendCardProps[]>(
    (acc, { post, mediaId, altText }) => {
      const LdImage = resolvedImagesMap[mediaId]
      const LImageUrl = LdImage?.downloadUrl || null
      const LdCommentary = post.commentary?.trim() || ""

      // Skip cards where the image download URL could not be resolved
      if (!LImageUrl) return acc

      acc.push({
        id: post.id,
        title: "",
        publishedAt: new Date(post.publishedAt).toISOString(),
        description: LdCommentary,
        media: {
          url: LImageUrl,
          alt: altText,
        },
        source: "LinkedIn",
        author: process.env.LINKEDIN_AUTHOR_NAME || "LMNAs Cloud Solutions",
      })

      return acc
    },
    []
  )

  return {
    data: LdFormattedPosts,
  }
}

// Caches the formatted posts array using Next.js cache and revalidates once every hour
export const LinkedInApi = unstable_cache(
  async () => {
    // Allows exceptions to bubble up so failed network calls are not permanently cached
    return await fetchLinkedInPostsInternal()
  },
  ["linkedin-org-posts-cache"],
  {
    revalidate: 3600,
    tags: ["linkedin-posts"],
  }
)