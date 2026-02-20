"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

const THEME_CHANNEL_NAME = "theme-sync-channel"

export function useThemeSynchronization() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    // Create a new BroadcastChannel
    const themeChannel = new BroadcastChannel(THEME_CHANNEL_NAME)

    // Listen for theme changes from other tabs
    themeChannel.addEventListener("message", (event) => {
      if (event.data && event.data.theme && event.data.theme !== theme) {
        setTheme(event.data.theme)
      }
    })

    // When theme changes in this tab, broadcast to other tabs
    if (theme) {
      themeChannel.postMessage({ theme })
    }

    // Clean up
    return () => {
      themeChannel.close()
    }
  }, [theme, setTheme])
}
