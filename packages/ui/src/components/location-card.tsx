"use client"

import Link from "next/link"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import * as SVG from "@repo/ui/svg/svgs"
import { getIconComponent } from "@repo/ui/lib/icon"
import { TlocationCard, Tbutton, Titems } from "@repo/middleware/types"

export default function LocationCard({ idLocation }: { idLocation: TlocationCard }) {
    const [LCopied, fnSetLCopied] = useState(false)

    const fnCopyAddress = (iAddress: string) => {
        // Use browser clipboard API to write text
        navigator.clipboard.writeText(iAddress).then(() => {
            fnSetLCopied(true)
            setTimeout(() => fnSetLCopied(false), 2000)
        })
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

    const fnRenderIcon = (iIcon: Tbutton['icon']) => {
        const LIconName = typeof iIcon === "string" ? iIcon : "HelpCircle";
        const IconComponent = getIconComponent(LIconName);
        return <IconComponent className="w-5 h-5" />;
    };

    return (
        <div className="relative">
            <div className="grid lg:grid-cols-12 items-start">
                <div className={`lg:col-span-5 ${idLocation.isReversed ? "lg:pl-5 order-1 lg:order-2" : "lg:pr-5"}`}>
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 mb-5 ml-1">
                            <div className="w-3 h-3 rounded-full bg-foreground" />
                            <span className="text-foreground text-sm tracking-widest uppercase">{idLocation.badge}</span>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-light mb-6">{idLocation.title}</h3>
                        <p className="text-foreground text-lg leading-relaxed mb-12">{idLocation.description}</p>

                        <div className="space-y-6">
                            {idLocation.contacts.some((lContact) => lContact.type === "address") &&
                                (() => {
                                    const lAddress = idLocation.contacts.find((lContact) => lContact.type === "address");
                                    if (!lAddress) return null;

                                    return (
                                        <div className="flex items-start gap-4 p-6 bg-accent border border-accent backdrop-blur-sm">
                                            <div className="mt-1 flex-shrink-0">{fnRenderIcon(lAddress.icon)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-foreground font-medium">{lAddress.label}</p>
                                                    <button
                                                        onClick={() => fnCopyAddress(lAddress.description || "")}
                                                        className="flex items-center gap-1 text-foreground text-sm"
                                                    >
                                                        {LCopied ? (
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
                                                <p className="text-foreground text-base leading-relaxed whitespace-pre-line">
                                                    {lAddress.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 grid grid-cols-1 gap-4">
                                    {idLocation.contacts
                                        .filter((lContact: Titems) => lContact.type === "phone")
                                        .map((lContact, lIndex) => (
                                            <div
                                                key={lIndex}
                                                className="flex items-center gap-4 p-4 bg-accent border border-accent backdrop-blur-sm"
                                            >
                                                {fnRenderIcon(lContact.icon)}
                                                <Link
                                                    href={`tel:${lContact.description}`}
                                                    className="text-foreground text-base"
                                                >
                                                    {lContact.description}
                                                </Link>
                                            </div>
                                        ))}
                                </div>

                                <div className="flex-1 grid grid-cols-1 gap-4">
                                    {idLocation.contacts
                                        .filter((lContact: Titems) => lContact.type === "mail")
                                        .map((lContact, lIndex) => {
                                            return (
                                                <div
                                                    key={lIndex}
                                                    className="flex items-center gap-4 p-4 bg-accent border border-accent backdrop-blur-sm"
                                                >
                                                    {fnRenderIcon(lContact.icon)}
                                                    <Link
                                                        href={`mailto:${lContact.description}`}
                                                        className="text-foreground text-base"
                                                    >
                                                        {lContact.description}
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {idLocation.contacts
                                .filter((lContact: Titems) => lContact.type === "hours")
                                .map((lContact, lIndex) => (
                                    <div
                                        key={lIndex}
                                        className="flex items-center gap-4 p-4 bg-accent border border-accent backdrop-blur-sm"
                                    >
                                        {fnRenderIcon(lContact.icon)}
                                        <p className="text-foreground text-base">{lContact.description}</p>
                                    </div>
                                ))}

                        </div>
                    </div>
                </div>

                <div
                    className={`lg:col-span-7 ${idLocation.isReversed ? "order-1 lg:order-1" : "order-1 lg:order-2"} relative z-20`}
                >
                    <div className="relative">
                        {fnGetSvg(idLocation.svg.svg as string, idLocation.svg.alternate)}
                        <div
                            className={`absolute bottom-2 lg:bottom-6 ${idLocation.isReversed ? "left-4 lg:left-6" : "right-4 lg:right-6"}`}
                        >
                            {idLocation.navigation.href && (
                                <Link
                                    target="_blank"
                                    href={idLocation.navigation.href}
                                    className="inline-flex items-center gap-2 text-foreground transition-colors group backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-accent border border-accent text-sm sm:text-base"
                                >
                                    <span className="font-medium">{idLocation.navigation.label}</span>
                                    {fnRenderIcon(idLocation.navigation.icon)}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}