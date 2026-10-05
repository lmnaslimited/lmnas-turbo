"use server"

import { TtrendCardProps } from "@repo/middleware/types"

/**
 * Return type definition for the LinkedIn API module
 * Wraps the array of transformed trend cards under a `data` key.
 */
export type TsocialAPIPostIds = {
  data: TtrendCardProps[]
}

/**
 * Shape of an individual raw LinkedIn Post element returned from the Posts API.
 */
type Tpost = {
  id: string
  publishedAt: number
  commentary: string
  content?: {
    media?: {
      id: string
      altText?: string
    }
  }
}

/**
 * Shape of the OAuth2 token payload returned when refreshing an access token.
 */
type TLinkedInTokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope?: string
}

// -----------------------------------------------------------------------------
// Utility: Fetch with timeout
// -----------------------------------------------------------------------------

/**
 * Wraps the native `fetch` API with an execution timeout.
 * Prevents requests from hanging indefinitely if the LinkedIn network stalls.
 *
 * @param iUrl - The target endpoint URL.
 * @param idOptions - Standard fetch configuration options (headers, method, etc.).
 * @param iTimeout - Timeout limit in milliseconds before the request rejects.
 * @returns A Promise resolving to the HTTP Response object.
 */
function fnFetchWithTimeout(
  iUrl: string,
  idOptions: RequestInit,
  iTimeout: number
): Promise<Response> {
  return new Promise((resolve, reject) => {
    // Set a timer to abort and reject if the fetch takes longer than iTimeout
    const LdTimer = setTimeout(
      () => reject(new Error("Request timed out")),
      iTimeout
    )

    fetch(iUrl, idOptions)
      .then(resolve)
      .catch(reject)
      // Clear timeout timer once the promise resolves or rejects to prevent memory leaks
      .finally(() => clearTimeout(LdTimer))
  })
}

// -----------------------------------------------------------------------------
// Utility: Retry fetch
// -----------------------------------------------------------------------------

/**
 * Retries a fetch request multiple times with a backoff delay if failures occur.
 *
 * @param iUrl - The target endpoint URL.
 * @param idOptions - Fetch request options.
 * @param iRetries - Maximum number of attempts allowed (default: 3).
 * @param iDelay - Delay in milliseconds between consecutive retry attempts (default: 3000ms).
 * @returns A Promise resolving to the successful HTTP Response.
 * @throws Error when all retry attempts fail.
 */
async function fnRetryFetch(
  iUrl: string,
  idOptions: RequestInit,
  iRetries: number = 3,
  iDelay: number = 3000
): Promise<Response> {
  let ldLastError: unknown

  for (let lAttempt = 0; lAttempt < iRetries; lAttempt++) {
    try {
      // Execute the request with a strict 10-second timeout per attempt
      return await fnFetchWithTimeout(iUrl, idOptions, 10000)
    } catch (error) {
      ldLastError = error

      // If more attempts remain, log progress and wait for the delay period
      if (lAttempt < iRetries - 1) {
        console.log(`LinkedIn request retry. Attempt ${lAttempt + 2}`)
        await new Promise((resolve) => setTimeout(resolve, iDelay))
      }
    }
  }

  // All attempts failed; log the root error and throw
  if (ldLastError instanceof Error) {
    console.error("LinkedIn request failed:", ldLastError.message)
  }

  throw new Error("LinkedIn request failed after retries")
}

// -----------------------------------------------------------------------------
// Authentication: Fetch fresh access token via OAuth2 Refresh Token
// -----------------------------------------------------------------------------

/**
 * Exchanges the persistent LinkedIn refresh token for a short-lived access token.
 * Requires environment variables:
 * - LINKEDIN_REFRESH_TOKEN
 * - LINKEDIN_CLIENT_ID
 * - LINKEDIN_CLIENT_SECRET
 *
 * @returns A valid Bearer access token string.
 */
async function fnGetLinkedInAccessToken(): Promise<string> {
  const LdRefreshToken = process.env.LINKEDIN_REFRESH_TOKEN
  const LdClientId = process.env.LINKEDIN_CLIENT_ID
  const LdClientSecret = process.env.LINKEDIN_CLIENT_SECRET

  // Guard clause: ensure all essential credentials are configured
  if (!LdRefreshToken) {
    throw new Error("LINKEDIN_REFRESH_TOKEN is not configured")
  }
  if (!LdClientId) {
    throw new Error("LINKEDIN_CLIENT_ID is not configured")
  }
  if (!LdClientSecret) {
    throw new Error("LINKEDIN_CLIENT_SECRET is not configured")
  }

  // Build the form-urlencoded OAuth2 refresh payload
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

  // Verify successful token issuance
  if (!LdResponse.ok) {
    const LdErrorText = await LdResponse.text()
    console.error("LinkedIn token refresh failed:", LdResponse.status, LdErrorText)
    throw new Error(`LinkedIn token refresh failed: ${LdResponse.status}`)
  }

  const LdTokenData = (await LdResponse.json()) as TLinkedInTokenResponse

  if (!LdTokenData.access_token) {
    throw new Error("LinkedIn did not return an access token")
  }

  return LdTokenData.access_token
}

// -----------------------------------------------------------------------------
// LinkedIn API Headers Builder
// -----------------------------------------------------------------------------

/**
 * Prepares HTTP standard and versioning headers required by LinkedIn REST APIs.
 *
 * @param iAccessToken - The active Bearer token.
 * @returns A configured Headers object.
 */
function fnGetLinkedInHeaders(iAccessToken: string): Headers {
  return new Headers({
    // Standard version tag indicating the API version contract
    "LinkedIn-Version": "202603",
    // Protocol header required by modern LinkedIn REST endpoints
    "X-Restli-Protocol-Version": "2.0.0",
    // Bearer authorization
    Authorization: `Bearer ${iAccessToken}`,
  })
}

// -----------------------------------------------------------------------------
// Main LinkedIn Fetch & Transform Service
// -----------------------------------------------------------------------------

/**
 * Main server action to retrieve, filter, and format LinkedIn organization posts.
 * Filters exclusively for posts containing image media and shapes the response
 * for the UI TrendCard components.
 */
export async function LinkedInApi(): Promise<TsocialAPIPostIds> {
  try {
    // -------------------------------------------------------------------------
    // STEP 1: Authenticate and retrieve fresh access token
    // -------------------------------------------------------------------------
    const LdAccessToken = await fnGetLinkedInAccessToken()
    const LdHeaders = fnGetLinkedInHeaders(LdAccessToken)

    // -------------------------------------------------------------------------
    // STEP 2: Fetch recent organization posts
    // -------------------------------------------------------------------------
    // Querying LinkedIn REST Posts endpoint for author URN 67940092
    const LdPostsUrl =
      "https://api.linkedin.com/rest/posts" +
      "?author=urn%3Ali%3Aorganization%3A67940092" +
      "&q=author" +
      "&count=20" +
      "&sortBy=LAST_MODIFIED"

    const LdResponse = await fnRetryFetch(LdPostsUrl, {
      method: "GET",
      headers: LdHeaders,
      redirect: "follow",
    })

    if (!LdResponse.ok) {
      const LdErrorText = await LdResponse.text()
      console.error("LinkedIn posts API failed:", LdResponse.status, LdErrorText)
      throw new Error(`LinkedIn posts API failed: ${LdResponse.status}`)
    }

    const LdLinkedIn = await LdResponse.json()

    // -------------------------------------------------------------------------
    // STEP 3: Keep image posts only
    // -------------------------------------------------------------------------
    // Filter elements to discard plain text, document, or non-image media posts
    const LaPostsWithMedia: Tpost[] = (LdLinkedIn.elements || []).filter(
      (post: Tpost) => post.content?.media?.id?.startsWith("urn:li:image:")
    )

    // -------------------------------------------------------------------------
    // STEP 4: Collect media IDs and their corresponding alt text
    // -------------------------------------------------------------------------
    const LaMediaMap = new Map<string, string>()
    const LaMediaIds: string[] = []

    LaPostsWithMedia.forEach((LdPost: Tpost) => {
      const LdMediaId = LdPost.content?.media?.id
      if (!LdMediaId) return

      LaMediaIds.push(LdMediaId)
      // Map media URN to custom altText (if provided by author)
      LaMediaMap.set(LdMediaId, LdPost.content?.media?.altText || "")
    })

    // If there are no image posts available, return an empty array early
    if (LaMediaIds.length === 0) {
      return { data: [] }
    }

    // -------------------------------------------------------------------------
    // STEP 5: Fetch binary image download URLs using batch images endpoint
    // -------------------------------------------------------------------------
    // Construct the comma-separated List(...) parameter with encoded image URNs
    const LencodedUrns = LaMediaIds.map((LdUrn) => encodeURIComponent(LdUrn))
    const LidsParam = `List(${LencodedUrns.join(",")})`
    const LdImageUrl = `https://api.linkedin.com/rest/images?ids=${LidsParam}`

    const LdImageResponse = await fnRetryFetch(LdImageUrl, {
      method: "GET",
      headers: LdHeaders,
      redirect: "follow",
    })

    if (!LdImageResponse.ok) {
      const LdErrorText = await LdImageResponse.text()
      console.error("LinkedIn image API failed:", LdImageResponse.status, LdErrorText)
      throw new Error(`LinkedIn image API failed: ${LdImageResponse.status}`)
    }

    const LdImageData = await LdImageResponse.json()

    // -------------------------------------------------------------------------
    // STEP 6: Transform and normalize data for TrendCard UI components
    // -------------------------------------------------------------------------
    const LdFormattedPosts: TtrendCardProps[] =
      LaPostsWithMedia.reduce<TtrendCardProps[]>((LaAcc, LdPost: Tpost) => {
        const LMediaId = LdPost.content?.media?.id
        if (!LMediaId) return LaAcc

        // Retrieve CDN download URL resolved from the images batch call
        const LdImage = LdImageData.results?.[LMediaId]
        const LImageUrl = LdImage?.downloadUrl || null
        const LdCommentary = LdPost.commentary?.trim() || ""

        // Media payload format for TrendCard component
        const LdMedia = LImageUrl
          ? {
              url: LImageUrl,
              alt: LaMediaMap.get(LMediaId) || "LinkedIn Post Image",
            }
          : undefined

        LaAcc.push({
          id: LdPost.id,

          /**
           * CRITICAL: Setting `title: ""` prevents the frontend card from rendering
           * an unwanted header text block above the picture.
           */
          title: "",

          // Standardize publication timestamp to ISO string
          publishedAt: new Date(LdPost.publishedAt).toISOString(),

          /**
           * The full post text is assigned to `description` so that it renders
           * strictly underneath the image on the card.
           */
          description: LdCommentary,

          media: LdMedia,
          source: "LinkedIn",
          author: "LMNAs Cloud Solutions",
        })

        return LaAcc
      }, [])

    // -------------------------------------------------------------------------
    // STEP 7: Return final shaped post payload
    // -------------------------------------------------------------------------
    return {
      data: LdFormattedPosts,
    }
  } catch (error) {
    // Top-level error catcher to prevent unhandled server crashes
    console.error("Error fetching LinkedIn posts:", error)
    return {
      data: [],
    }
  }
}