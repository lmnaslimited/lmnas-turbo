"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useThemeSynchronization } from "@repo/ui/lib/broadcastChannel";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useThemeSynchronization();

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
