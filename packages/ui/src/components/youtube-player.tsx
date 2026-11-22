"use client";

type TyouTubePlayerProps = {
  iUrl?: string | null;
  iTitle?: string;
};

function fnGetYouTubeVideoId(iUrl?: string | null): string | null {
  if (!iUrl) return null;

  try {
    const LParsedUrl = new URL(iUrl);
    const LHostname = LParsedUrl.hostname.replace(/^www\./, "");

    let lVideoId: string | null = null;

    if (LHostname === "youtu.be") {
      lVideoId = LParsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      LHostname === "youtube.com" ||
      LHostname === "m.youtube.com" ||
      LHostname === "youtube-nocookie.com"
    ) {
      if (LParsedUrl.pathname === "/watch") {
        lVideoId = LParsedUrl.searchParams.get("v");
      } else {
        const LMatch = LParsedUrl.pathname.match(
          /^\/(?:embed|shorts|live)\/([^/]+)/
        );
        lVideoId = LMatch?.[1] ?? null;
      }
    }
    return lVideoId && /^[a-zA-Z0-9_-]{11}$/.test(lVideoId)
      ? lVideoId
      : null;
  } catch {
    console.error("Invalid YouTube URL:", iUrl);
    return null;
  }
}

export default function YouTubePlayer({
  iUrl,
  iTitle = "YouTube video",
}: TyouTubePlayerProps) {

  const LVideoId = fnGetYouTubeVideoId(iUrl);

  if (!LVideoId) return null;

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-black shadow-sm">
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${LVideoId}?rel=0`}
          title={iTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}