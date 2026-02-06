type VideoPlayerProps = {
    src: string
    sourceId?: string
}

export default function VideoPlayer({ src, sourceId }: VideoPlayerProps) {

    const subtitleUrl =
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