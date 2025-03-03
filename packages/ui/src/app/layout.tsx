import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@repo/ui/globals.css"
import { ThemeProvider } from "@repo/ui/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LMNAs Cloud Solutions - AI-Powered ERP Solutions",
  description: "Enterprise-grade cloud solutions with AI integration for modern businesses",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

