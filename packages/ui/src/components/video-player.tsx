import { TvideoPlayerProps } from "@repo/middleware/types"

export default function VideoPlayer({ src, sourceId }: TvideoPlayerProps) {

    const LSubtitleUrl =
        sourceId
            ? `/api/subtitle?sourceId=${sourceId}`
            : undefined

    return (
        <video
            className="aspect-[16/9] w-full object-cover rounded-sm"
            autoPlay
            muted
            loop
            playsInline
        >
            <source src={src} type="video/mp4" />

            {LSubtitleUrl && (
                <track
                    src={LSubtitleUrl}
                    kind="subtitles"
                    srcLang="en"
                    label="English"
                    default
                />
            )}
        </video>
    )
}