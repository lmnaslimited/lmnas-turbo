"use client"

import { CircleCheckBig, CircleX,CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";


export default function FreeOptIn({ idContent }: Record<string, any>) { 
    // Retrieves the current locale from the route parameters.
    const LdParams = useParams();
    // Extract the locale value from the route parameters.
    const LLocale = LdParams.locale as string;

   
    const LCurrentLocale = (LLocale && LLocale in idContent) ? LLocale : 'en';
    // Fallback to English if the requested locale doesn't exist
    const LdContent = idContent[LCurrentLocale] || idContent.en;

    return (
        <section className="relative  flex items-center overflow-hidden border-b border-border/40 bg-background py-20 md:py-24">
            {/* Background Glow Overlay */}
            <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[140px]" />
            <div className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />

            <div className="relative w-full px-4 md:px-8 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

                    {/* Left Column - Dynamic Form View */}
                    <div className="lg:col-span-6 space-y-8">
                        {/* <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-primary backdrop-blur-sm shadow-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span>{LdContent.earlyAccess}</span>
                        </div> */}

                        <h2 className="text-4xl font-bold text-foreground md:text-5xl lg:text-5xl leading-1">
                            {LdContent.titleMain}{" "}
                            <span className="text-primary">
                                {LdContent.titleAccent}
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                            {LdContent.description}
                        </p>
                        <button 
                        className="bg-primary text-background p-4 rounded-lg w-full"
                        type="button"
                        >
                            <Link href={`/${LLocale}/login`}>{LdContent.btnSecureSpot}</Link>
                        </button>
                        {/* Signals list */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                            {LdContent.signals.map((iSignal: string) => (
                                <div
                                    key={iSignal}
                                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium"
                                >
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                    <span>{iSignal}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Pricing Card */}
                    <div className="lg:col-span-5 w-full max-w-md mx-auto">
                        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 transition-all duration-300 hover:shadow-primary/5">
                            <div className="bg-primary py-2.5 text-center">
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                                    {LdContent.ribbonText}
                                </span>
                            </div>
                            <div className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-start justify-between border-b border-border/60 pb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground">
                                            {LdContent.planName}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {LdContent.freeForever}
                                        </p>
                                    </div>
                                    <div className="text-right leading-none">
                                        <span className="text-4xl sm:text-5xl font-black text-foreground">
                                            $0
                                        </span>
                                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                                            {LdContent.perMonth}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {LdContent.whatsIncluded}
                                    </h4>
                                    <ul className="space-y-2.5 text-xs sm:text-sm">
                                        <li className="flex items-start gap-3 rounded-2xl bg-accent/50 border border-border/50 p-3.5 transition-colors hover:bg-accent">
                                            <CircleCheckBig className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                            <span>
                                                <strong className="font-semibold text-foreground">{LdContent.incInstanceTitle} </strong>
                                                <span className="text-muted-foreground">{LdContent.incInstanceDesc}</span>
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 rounded-2xl bg-accent/50 border border-border/50 p-3.5 transition-colors hover:bg-accent">
                                            <CircleCheckBig className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                            <span>
                                                <strong className="font-semibold text-foreground">{LdContent.incPlatformTitle} </strong>
                                                <span className="text-muted-foreground">{LdContent.incPlatformDesc}</span>
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {LdContent.capabilities}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {LdContent.capabilityList.map(
                                            ({
                                                label,
                                                available,
                                            }: {
                                                label: string;
                                                available: boolean;
                                            }) => (
                                                <div
                                                    key={label}
                                                    className={`flex items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                                                        available
                                                            ? "bg-accent/40 border-border/60 text-foreground"
                                                            : "bg-muted/30 border-border/30 text-muted-foreground/60"
                                                    }`}
                                                >
                                                    <span className="truncate">{label}</span>
                                                    {available ? (
                                                        <CircleCheckBig className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    ) : (
                                                        <CircleX className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <p className="text-center text-xs text-muted-foreground pt-4">
                                        {LdContent.noCreditCard}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

