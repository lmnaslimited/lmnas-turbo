export type TsocialAPIPostIds = {
  HeroPost: TsocialPostId[];
  largeHighlight: TsocialPostId[];
  smallerHighlight: TsocialPostId[];
  carouselPosts: TsocialPostId[];
}

export type TsocialPostId = {
  publishedAt: number;
  id: string;
  commentary: string;
  media: {
    altText: string;
    url: string;
  };
};

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout = 15000
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]);
};

async function fetchImageUrl(mediaId: string): Promise<string | null> {
  const myHeaders = new Headers({
    "LinkedIn-Version": "202411",
    Authorization: `${process.env.LINKEDIN_ACCESS_TOKEN}`,
  });

  try {
    const response = await fetchWithTimeout(
      `https://api.linkedin.com/rest/images/${mediaId}`,
      {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      },
      10000
    );

    if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);

    const imageData = await response.json();
    return imageData.downloadUrl || null;
  } catch (error) {
    console.error(`Error fetching image URL for ${mediaId}:`, error);
    return null;
  }
}

export async function getExternalSocialPageData(
  locale: string
): Promise<TsocialAPIPostIds> {
  const myHeaders = new Headers({
    "LinkedIn-Version": "202411",
    Authorization: `${process.env.LINKEDIN_ACCESS_TOKEN}`,
  });

  try {
    const response = await fetchWithTimeout(
      "https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A67940092&q=author&count=13",
      {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      },
      20000
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiData = await response.json();
    const posts = apiData.elements
      .filter(
        (post: { content: { media: { id: string; altText: string } } }) =>
          post.content?.media
      )
      .map(
        async (post: {
          content: { media: { id: string; altText: string } };
          publishedAt: number;
          id: string;
          commentary: string;
        }) => {
          const imageUrl = await fetchImageUrl(post.content.media.id);
          return {
            publishedAt: post.publishedAt,
            id: post.id,
            commentary: post.commentary,
            media: imageUrl
              ? { altText: post.content.media.altText, url: imageUrl }
              : null,
          };
        }
      );

    const finalPosts = (await Promise.all(posts)).filter(
      (post) => post.media !== null
    );

    return {
      HeroPost: finalPosts.slice(0, 1),
      largeHighlight: finalPosts.slice(1, 3),
      smallerHighlight: finalPosts.slice(3, 6),
      carouselPosts: finalPosts.slice(6, 13),
    };
  } catch (error) {
    console.error("Error fetching LinkedIn posts:", error);
    throw error;
  }
}