"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type CTAContextValue = {
    isChatOpen: boolean
    benefitSlug: string | null
    openChat: (benefitSlug: string) => void
    closeChat: () => void
}

const CTAContext = createContext<CTAContextValue | undefined>(undefined)

export function CTAContextProvider({ children }: { children: ReactNode }) {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [benefitSlug, setBenefitSlug] = useState<string | null>(null)

    const value = useMemo(
        () => ({
            isChatOpen,
            benefitSlug,
            openChat: (slug: string) => {
                setBenefitSlug(slug)
                setIsChatOpen(true)
            },
            closeChat: () => setIsChatOpen(false),
        }),
        [benefitSlug, isChatOpen],
    )

    return <CTAContext.Provider value={value}>{children}</CTAContext.Provider>
}

export function useCTAContext() {
    const ctx = useContext(CTAContext)
    // console.log("CTAContext value:", ctx) // Debug log to check context value
    if (!ctx) throw new Error("useCTAContext must be used within CTAContextProvider")
    return ctx
}