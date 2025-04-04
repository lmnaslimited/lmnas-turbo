"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { ReactElement, ReactNode, useEffect, useState } from "react"

import { Switch } from "@repo/ui/components/ui/switch"

export function ThemeToggle():ReactNode {
  const { theme, setTheme } = useTheme() //this variable is from nextjs
  const [Mounted, fnSetMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    fnSetMounted(true)
  }, [])

  if (!Mounted) {
    return null
  }

  const fnToggleTheme = ():void => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="flex items-center space-x-2 transition-all duration-700">
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ${
          theme === "dark" ? "text-muted-foreground scale-75 rotate-12" : "text-foreground scale-100 rotate-0"
        }`}
      />
      <Switch
        checked={theme !== "light"}
        onCheckedChange={fnToggleTheme}
        aria-label="Toggle theme"
        className="transition-all duration-700 hover:scale-110"
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700  ${
          theme === "light" ? "text-muted-foreground scale-75 rotate-12" : "text-foreground scale-100 rotate-0"
        }`}
      />
    </div>
  )
}

