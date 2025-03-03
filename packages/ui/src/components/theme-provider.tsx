"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useThemeSynchronization } from "@repo/ui/lib/broadcast-channel"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useThemeSynchronization()

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

