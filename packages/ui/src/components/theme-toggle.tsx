"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Switch } from "@repo/ui/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme() //this variable is from nextjs
  const [Mounted, fnSetMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    fnSetMounted(true)
  }, [])

  if (!Mounted) {
    return null
  }

  const fnToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="flex items-center space-x-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === "dark" ? "text-muted-foreground scale-75 rotate-12" : "text-foreground scale-100 rotate-0"
        }`}
      />
      <Switch
        checked={theme !== "light"}
        onCheckedChange={fnToggleTheme}
        aria-label="Toggle theme"
        className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110"
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === "light" ? "text-muted-foreground scale-75 rotate-12" : "text-foreground scale-100 rotate-0"
        }`}
      />
    </div>
  )
}

