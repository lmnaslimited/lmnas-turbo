'use server';

import { TapiResponse, TwitterApiResponse } from "@repo/middleware";

export async function TwitterApi(): Promise<TapiResponse> {

  const LdHeaders = {
    Authorization: `${process.env.TWITTER_BEARER_TOKEN}`,
  };

  // Step 1: Get the latest 20 tweets for the user
  const userTweetsResponse = await fetch(
    `https://api.twitter.com/2/users/${process.env.TWITTER_USER_NAME}/tweets?max_results=20`,
    { headers: LdHeaders }
  );

  if (!userTweetsResponse.ok) {
    throw new Error('Failed to fetch tweets');
  }

  const LdUserTweetsData = await userTweetsResponse.json();

  const LTweetIds = LdUserTweetsData.data?.map((tweet: any) => tweet.id).join(',');

  if (!LTweetIds) {
    throw new Error('No tweets found');
  }

  // Step 2: Get tweet details
  const LdTweetResponse = await fetch(
    `https://api.twitter.com/2/tweets?ids=${LTweetIds}&tweet.fields=created_at,text,attachments,author_id&expansions=author_id,attachments.media_keys&user.fields=name,username&media.fields=url,alt_text,preview_image_url`,
    { headers: LdHeaders }
  );

  if (!LdTweetResponse.ok) {
    throw new Error('Failed to fetch tweet details');
  }

  const LdTweetDetails = await LdTweetResponse.json();

  const LdTwitterApiResponse: TwitterApiResponse = LdTweetDetails;

  const LaTweets = LdTwitterApiResponse.data || [];
  const LdUsersMap = new Map(
    (LdTwitterApiResponse.includes?.users || []).map((idUser) => [idUser.id, idUser])
  );
  const LdMediaMap = new Map(
    (LdTwitterApiResponse.includes?.media || []).map((idMedia) => [idMedia.media_key, idMedia])
  );

  const LaFormattedTweets = LaTweets.map((tweet) => {
    const LdAuthor = LdUsersMap.get(tweet.author_id);
    const LMediaKey = tweet.attachments?.media_keys?.[0];
    const LdMedia = LMediaKey ? LdMediaMap.get(LMediaKey) : null;
    const LMediaUrl = LdMedia?.url;
    const LMediaAlt = LdMedia?.alt_text || tweet.text;

    let LdMediaToDisplay = {
      url: LMediaUrl,
      alt: LMediaAlt,
    };

    // Check if the media has a preview image URL (which is typically available for video)
    if (LdMedia && LdMedia.preview_image_url) {

      LdMediaToDisplay = {
        url: LdMedia.preview_image_url, // Use the preview image for videos
        alt: LMediaAlt,
      };
    }

    return {
      id: tweet.id,
      publishedAt: tweet.created_at,
      title: tweet.text.split('\n')[0], // Use first line as title
      description: tweet.text,
      author: LdAuthor?.name ?? 'Unknown',
      source: 'X',
      media: LdMediaToDisplay,
    };
  });
  return {
    message: 'Tweets fetched successfully',
    data: LaFormattedTweets,
  };
}