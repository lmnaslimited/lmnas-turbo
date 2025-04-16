'use server'

import { TtrendCardProps } from "@repo/ui/type";

export type TsocialAPIPostIds = {
    data: TtrendCardProps[];
  }
  
  const fnFetchWithTimeout = (iUrl: string, idOptions: RequestInit, iTimeout = 15000
  ): Promise<Response> => {
    return Promise.race([
      fetch(iUrl, idOptions),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), iTimeout)
      ),
    ]);
  };
  
  async function fnFetchImageUrl(iMediaId: string): Promise<string | null> {
    const myHeaders = new Headers({
      "LinkedIn-Version": "202411",
      Authorization: `${process.env.LINKEDIN_ACCESS_TOKEN}`,
    });
  
    try {
      const LdResponse = await fnFetchWithTimeout(
        `https://api.linkedin.com/rest/images/${iMediaId}`,
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        },
        20000
      );
  
      if (!LdResponse.ok) throw new Error(`Image fetch failed: ${LdResponse.status}`);
  
      const LdImageData = await LdResponse.json();
      return LdImageData.downloadUrl || null;
    } catch (error) {
      console.error(`Error fetching image URL for ${iMediaId}:`, error);
      return null;
    }
  }
  

  export async function LinkedInApi(): Promise<TsocialAPIPostIds> {
    const myHeaders = new Headers({
      "LinkedIn-Version": "202411",
      Authorization: `${process.env.LINKEDIN_ACCESS_TOKEN}`,
    });
  
    try {
      const LdResponse = await fnFetchWithTimeout(
        "https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A67940092&q=author&count=20",
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        },
        20000
      );
  
      if (!LdResponse.ok) {
        throw new Error(`HTTP error! Status: ${LdResponse.status}`);
      }
  
      const LdLinkedIn = await LdResponse.json();
      const LdPosts = LdLinkedIn.elements
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
            const LImageUrl = await fnFetchImageUrl(post.content.media.id);
            return {
              publishedAt: post.publishedAt,
              id: post.id,
              description: post.commentary,
              media: LImageUrl
                ? { altText: post.content.media.altText, url: LImageUrl }
                : null,
              source: "LinkedIn",
              author: "LMNAs Cloud Solutions"
            };
          }
        );
  
      const LaFormatedPosts = (await Promise.all(LdPosts)).filter(
        (post) => post.media !== null
      );
      return {data: LaFormatedPosts}
    } catch (error) {
      console.error("Error fetching LinkedIn posts:", error);
      throw error;
    }
  }