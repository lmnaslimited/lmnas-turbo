"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { TbenefitType } from "@repo/middleware/types"

type CTAContextValue = {
    isChatOpen: boolean
    benefitType: TbenefitType | null
    openChat: (benefitType: TbenefitType) => void
    closeChat: () => void
}
const CTAContext = createContext<CTAContextValue | undefined>(undefined)

export function CTAContextProvider({ children }: { children: ReactNode }) {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [benefitType, setBenefitType] = useState<TbenefitType | null>(null)

    const value = useMemo(
        () => ({
            isChatOpen,
            benefitType,
            openChat: (slug: TbenefitType) => {
                setBenefitType(slug)
                setIsChatOpen(true)
            },
            closeChat: () => setIsChatOpen(false),
        }),
        [benefitType, isChatOpen],
    )

    return <CTAContext.Provider value={value}>{children}</CTAContext.Provider>
}

export function useCTAContext() {
    const ctx = useContext(CTAContext)
    if (!ctx) throw new Error("useCTAContext must be used within CTAContextProvider")
    return ctx
}