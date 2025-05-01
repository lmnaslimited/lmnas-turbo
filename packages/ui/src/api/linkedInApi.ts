'use server'

import { TtrendCardProps } from "@repo/middleware";

export type TsocialAPIPostIds = {
  data: TtrendCardProps[];
};
export type Tpost = {
  content: { media: { id: string; altText: string } }
}

// ----------------------------------------
// Utility: Fetch with timeout
// ----------------------------------------
// Wraps fetch in a timeout to prevent hanging requests
function fnFetchWithTimeout(iUrl: string, idOptions: RequestInit, iTimeout: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const LdTimer = setTimeout(() => reject(new Error('Request timed out')), iTimeout);
    fetch(iUrl, idOptions)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(LdTimer));
  });
}

// ----------------------------------------
// Utility: Retry fetch with delay and timeout
// ----------------------------------------
// Retries failed fetch requests up to `iRetries` times, with a delay between each retry
async function fnRetryFetch(iUrl: string, idOptions: RequestInit, iRetries: number = 3, iDelay: number = 3000): Promise<Response> {
  let ldLastError
  for (let lAttempt = 0; lAttempt < iRetries; lAttempt++) {
    try {
      return await fnFetchWithTimeout(iUrl, idOptions, 10000); // 10 seconds timeout for each request
    } catch (error) {
      ldLastError = error;
      // Retry only if not the last attempt
      if (lAttempt < iRetries - 1) {
        console.log(`Retrying... Attempt ${lAttempt + 2}`);
        await new Promise(resolve => setTimeout(resolve, iDelay)); // wait before retry
      }
    }
  }

  // Final error handling if all retries fail
  if (ldLastError instanceof Error) {
    console.error('Error during fetch operation:', ldLastError.message);
  }
  throw new Error('Failed after retries'); // If all retries fail
}

export async function LinkedInApi(): Promise<TsocialAPIPostIds> {
  // Prepare request headers for LinkedIn API
  const LdHeaders = new Headers({
    "LinkedIn-Version": "202411",
    Authorization: `${process.env.LINKEDIN_ACCESS_TOKEN}`,
  });

  try {
    // Step 1: Fetch latest 20 posts from the organization's LinkedIn page
    const LdResponse = await fnRetryFetch(
      "https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A67940092&q=author&count=20",
      {
        method: "GET",
        headers: LdHeaders,
        redirect: "follow",
      }
    );

    if (!LdResponse.ok) {
      throw new Error(`HTTP error! Status: ${LdResponse.status}`);
    }

    const LdLinkedIn = await LdResponse.json();

    // Step 2: Filter posts that have media (e.g., images)
    const LaPostsWithMedia = LdLinkedIn.elements.filter(
      (post: { content: { media?: { id: string; altText: string } } }) =>
        post.content?.media?.id
    );
    // Step 3: Collect media IDs and map them with alt text for later use
    const LaMediaMap = new Map<string, string>();
    const LaMediaIds: string[] = [];

    LaPostsWithMedia.forEach((idPost: Tpost) => {
      const LId = idPost.content.media.id;
      LaMediaIds.push(LId);
      LaMediaMap.set(LId, idPost.content.media.altText || "");
    });

    // Step 4: Fetch image data in bulk using media IDs
    const LImageUrl = new URL("https://api.linkedin.com/rest/images");
    LaMediaIds.forEach((iId) => LImageUrl.searchParams.append("ids", iId)); // Append each media ID

    const LdImageResponse = await fnRetryFetch(LImageUrl.toString(), {
      method: "GET",
      headers: LdHeaders,
      redirect: "follow",
    });

    if (!LdImageResponse.ok) {
      throw new Error(`Failed to fetch images`);
    }

    const LdImageData = await LdImageResponse.json();
    // Step 5: Map and format final post data to be returned
    const LdFormattedPosts: TtrendCardProps[] = LaPostsWithMedia.map((post: any) => {
      const LMediaId = post.content.media.id;
      const LdImage = LdImageData.results[LMediaId]; // Extract the image data from the response
      const LImageUrl = LdImage?.downloadUrl || null;
      return {
        publishedAt: post.publishedAt,
        id: post.id,
        description: post.commentary,
        media: LImageUrl ? {
          altText: LaMediaMap.get(LMediaId) || "",
          url: LImageUrl,
        } : null,
        source: "LinkedIn",
        author: "LMNAs Cloud Solutions",
      };
    })
    // Return the final formatted post data
    return { data: LdFormattedPosts };
  } catch (error) {
    console.error("Error fetching LinkedIn posts:", error);
    return { data: [] }; // Return empty data in case of failure
  }
}