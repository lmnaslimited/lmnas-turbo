"use client"

import Link from "next/link"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { getIconComponent } from "@repo/ui/lib/icon"
import { TlocationCard, Titems } from "@repo/middleware"
import * as SVG from "@repo/ui/svg/svgs"

export default function LocationCard({ location: iLocation }: { location: TlocationCard }) {
    const [lCopied, setLCopied] = useState(false)

    const fnCopyAddress = (iAddress: string) => {
        navigator.clipboard.writeText(iAddress).then(() => {
            setLCopied(true)
            setTimeout(() => setLCopied(false), 2000)
        })
    }

    const fnGetIcon = (iIcon: string | undefined) => {
        const lIconName = iIcon || "HelpCircle";
        const IconComponent = getIconComponent(lIconName);
        return IconComponent;
    }

    const fnGetSvg = (iSvgName: string, iAlt: string) => {
        const SvgComponent = (SVG as any)[iSvgName]
        return SvgComponent ? (
            <div className="aspect-[4/3] overflow-hidden flex items-center justify-center">
                <SvgComponent className="w-full h-full object-fill" />
            </div>
        ) : (
            <span className="text-white/60">{iAlt || "No Image"}</span>
        )
    }

    return (
        <div className="relative">
            <div className="grid lg:grid-cols-12 items-start">
                {/* Left Content */}
                <div className={`lg:col-span-5 ${iLocation.isReversed ? "lg:pl-5 order-1 lg:order-2" : "lg:pr-5"}`}>
                    <div className="relative">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 mb-5 ml-1">
                            <div className="w-3 h-3 rounded-full bg-foreground" />
                            <span className="text-foreground text-sm tracking-widest uppercase">{iLocation.badge}</span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-3xl md:text-4xl font-light mb-6">{iLocation.title}</h3>
                        <p className="text-foreground text-lg leading-relaxed mb-12">{iLocation.description}</p>

                        {/* Contact Sections */}
                        <div className="space-y-6">
                            {/* Address */}
                            {iLocation.contacts.some(lContact => lContact.type === "address") && (() => {
                                const lAddress = iLocation.contacts.find(lContact => lContact.type === "address")
                                if (!lAddress) return null
                                const IconComponent = fnGetIcon(lAddress.icon || "HelpCircle")
                                return (
                                    <div className="flex items-start gap-4 p-6 bg-accent border border-accent backdrop-blur-sm">
                                        <IconComponent className="h-5 w-5 text-foreground mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-foreground font-medium">{lAddress.label}</p>
                                                <button
                                                    onClick={() => fnCopyAddress(lAddress.description)}
                                                    className="flex items-center gap-1 text-foreground text-sm"
                                                >
                                                    {lCopied ? (
                                                        <>
                                                            <Check className="h-3 w-3" />
                                                            <span>Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3 w-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-foreground text-base leading-relaxed whitespace-pre-line">{lAddress.description}</p>
                                        </div>
                                    </div>
                                )
                            })()}

                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Phone Info */}
                                <div className="flex-1 grid grid-cols-1 gap-4">
                                    {iLocation.contacts
                                        .filter((lContact: Titems) => lContact.type === "phone")
                                        .map((lContact, lIndex) => {
                                            const IconComponent = fnGetIcon(lContact.icon)
                                            return (
                                                <div
                                                    key={lIndex}
                                                    className="flex items-center gap-4 p-4 bg-accent border border-accent backdrop-blur-sm"
                                                >
                                                    <IconComponent className="h-4 w-4 text-foreground flex-shrink-0" />
                                                    <Link
                                                        href={`tel:${lContact.description}`}
                                                        className="text-foreground text-base"
                                                    >
                                                        {lContact.description}
                                                    </Link>
                                                </div>
                                            )
                                        })}
                                </div>

                                {/* Mail Info */}
                                <div className="flex-1 grid grid-cols-1 gap-4">
                                    {iLocation.contacts
                                        .filter((lContact: Titems) => lContact.type === "mail")
                                        .map((lContact, lIndex) => {
                                            const IconComponent = fnGetIcon(lContact.icon)
                                            return (
                                                <div
                                                    key={lIndex}
                                                    className="flex items-center gap-4 p-4 bg-accent border border-accent backdrop-blur-sm"
                                                >
                                                    <IconComponent className="h-4 w-4 text-foreground flex-shrink-0" />
                                                    <Link
                                                        href={`mailto:${lContact.description}`}
                                                        className="text-foreground text-base"
                                                    >
                                                        {lContact.description}
                                                    </Link>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>


                            {/* Hours Info */}
                            {iLocation.contacts
                                .filter((lContact: Titems) => lContact.type === "hours")
                                .map((lContact, lIndex) => {
                                    const IconComponent = fnGetIcon(lContact.icon)
                                    return (
                                        <div
                                            key={lIndex}
                                            className="flex items-center gap-4 p-4 bg-accent border border-accent backdrop-blur-sm"
                                        >
                                            <IconComponent className="h-4 w-4 text-foreground flex-shrink-0" />
                                            <p className="text-foreground text-base">{lContact.description}</p>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                </div>

                {/* Right Image */}
                <div
                    className={`lg:col-span-7 ${iLocation.isReversed ? "order-1 lg:order-1" : "order-1 lg:order-2"} relative z-20`}
                >
                    <div className="relative">
                        {fnGetSvg(iLocation.svg.svg, iLocation.svg.alternate)}
                        <div
                            className={`absolute bottom-2 lg:bottom-6 ${iLocation.isReversed ? "left-4 lg:left-6" : "right-4 lg:right-6"}`}
                        >
                            <Link
                                target="_blank"
                                href={iLocation.navigation.href}
                                className="inline-flex items-center gap-2 text-foreground transition-colors group backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-accent border border-accent text-sm sm:text-base"
                            >
                                <span className="font-medium">{iLocation.navigation.label}</span>
                                {(() => {
                                    const IconComponent = fnGetIcon(iLocation.navigation.icon)
                                    return (
                                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                                    )
                                })()}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}