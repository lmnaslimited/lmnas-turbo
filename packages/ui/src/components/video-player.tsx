import { Tsubtitle } from "@repo/middleware/types"

type VideoPlayerProps = {
    src: string
    subtitle?: Tsubtitle[]
}

const VideoPlayer = ({ src, subtitle }: VideoPlayerProps) => {
    console.log("subtitle:", subtitle);

    const subtitleUrl = subtitle
        ? `/api/subtitle?data=${JSON.stringify(subtitle)}`
        : undefined

    // console.log("subtitleUrl:", subtitleUrl);

    return (
        <video
            className="aspect-[16/9] w-full object-cover rounded-sm"
            width={1000}
            height={1000}
            autoPlay
            muted
            loop
            playsInline
        >
            <source src={src} type="video/mp4" />

            {subtitleUrl && (
                <track
                    src={subtitleUrl}
                    kind="subtitles"
                    srcLang="en"
                    label="English"
                    default
                />
            )}
        </video>
    )
}

export default VideoPlayer