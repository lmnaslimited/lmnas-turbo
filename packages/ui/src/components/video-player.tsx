"use client"

import { TvideoPlayerProps } from "@repo/middleware/types"
import { useParams } from "next/navigation"

export default function VideoPlayer({ src, sourceId }: TvideoPlayerProps) {

    const LdParams = useParams()
    const LLocale = LdParams?.locale as string

    const LSubtitleUrl =
        sourceId
            ? `/api/subtitle?sourceId=${sourceId}&locale=${LLocale}`
            : null

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
                    srcLang={LLocale}
                    label={LLocale?.toUpperCase()}
                    default
                />
            )}
        </video>
    )
}