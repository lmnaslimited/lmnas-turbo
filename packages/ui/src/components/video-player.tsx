"use client";

import { TvideoPlayerProps } from "@repo/middleware/types";
import { useParams } from "next/navigation";

//Video player component that takes video source and sourceId for fetching subtitles
export default function VideoPlayer({ src, sourceId }: TvideoPlayerProps) {
  const LdParams = useParams();
  const LLocale = LdParams?.locale as string;
    /**
     * Build subtitle API URL
     * If sourceId exists, fetch subtitles for the given video and locale
     * Otherwise subtitles are not loaded
     */
  const LSubtitleUrl = sourceId
    ? `/api/subtitle?sourceId=${sourceId}&locale=${LLocale}`
    : null;

  return (
    <video
      className="aspect-[16/9] w-full object-cover rounded-sm"
    //   video playback settings for better user experience
      autoPlay
      muted
      loop
      playsInline
    >
      <source src={src} type="video/mp4" />
    {/* Subtitle track - rendered only if subtitle URL exists */}
      {LSubtitleUrl && (
        <track
          src={LSubtitleUrl}
          kind="subtitles"
          srcLang={LLocale}
          label={LLocale?.toUpperCase()}
          default
        />
      )}
    </video>
  );
}
