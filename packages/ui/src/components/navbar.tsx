"use client"

import * as React from "react"
import Link from "next/link"
import { Globe, MoreHorizontal, Moon, Sun } from "lucide-react"

import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/ui/navigation-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu"
import { Switch } from "@repo/ui/components/ui/switch"

const products = [
  {
    title: "ERP Suite",
    href: "/products/lens-erp-suite",
    description: "Powering Your Business Operations",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
]

const industries = [
  {
    title: "Manufacturing",
    href: "/industries/manufacturing",
    description: "Industrial solutions for factories",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      </svg>
    ),
  },
  {
    title: "Distribution",
    href: "/industries/distribution",
    description: "Supply chain optimization tools",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <rect width="6" height="6" x="9" y="9" rx="1" />
        <path d="M15 2v2" />
        <path d="M15 20v2" />
        <path d="M2 15h2" />
        <path d="M20 15h2" />
      </svg>
    ),
  },
  {
    title: "Retail",
    href: "/industries/retail",
    description: "Point of sale and inventory management",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
        <path d="M2 7h20" />
        <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
      </svg>
    ),
  },
]

const more = [
  {
    title: "About Us",
    href: "/about-us",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Carrers",
    href: "/carrers",
  },
  {
    title: "Trending",
    href: "/trending-now",
  },
]

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
]

export function Navbar() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [language, setLanguage] = React.useState("en")
  const [moreDropdownOpen, setMoreDropdownOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = React.useState(false)
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = React.useState(false)
  const [mobileModeDropdownOpen, setMobileModeDropdownOpen] = React.useState(false)

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Get current language display
  const getCurrentLanguageDisplay = () => {
    const currentLang = languages.find((lang) => lang.code === language)
    return currentLang ? currentLang.code.toUpperCase() : "EN"
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800",
          isScrolled ? "bg-white/80 backdrop-blur-md dark:bg-gray-900/80" : "bg-transparent dark:bg-transparent",
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight dark:text-white">LMNAs</span>
            </Link>

            {/* Desktop Navigation - Left aligned on large screens, centered on medium */}
            <div className="hidden lg:flex lg:items-center">
              <NavigationMenu className="md:justify-center">
                <NavigationMenuList className="flex items-center">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-md flex items-center dark:text-white transition-transform duration-200 hover:scale-105">
                      Products
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-gray-200 dark:border-gray-800 shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2">
                          {products.map((product) => (
                            <Link href={product.href} key={product.title}>
                              <div className="flex items-start gap-2 transition-transform duration-200 hover:scale-105">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 dark:text-white">
                                  <div className="w-6 h-6 flex items-center justify-center">{product.icon}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  dark:text-white">{product.title}</span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-md flex items-center h-10 dark:text-white transition-transform duration-200 hover:scale-105">
                      Industries
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-gray-200 dark:border-gray-800 shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2">
                          {industries.map((industry) => (
                            <Link href={industry.href} key={industry.title}>
                              <div
                                key={industry.title}
                                className="flex items-start gap-2 transition-transform duration-200 hover:scale-105"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 dark:text-white">
                                  <div className="w-6 h-6 flex items-center justify-center">{industry.icon}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  dark:text-white">{industry.title}</span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{industry.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link href="/solutions" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-md h-10 flex items-center dark:text-white transition-transform duration-200 hover:scale-105",
                        )}
                      >
                        Solutions
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link href="/pricing" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-md h-10 flex items-center dark:text-white transition-transform duration-200 hover:scale-105",
                        )}
                      >
                        Pricing
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem className="flex items-center">
                    <DropdownMenu open={moreDropdownOpen} onOpenChange={setMoreDropdownOpen}>
                      <DropdownMenuTrigger
                        asChild
                        onMouseEnter={() => setMoreDropdownOpen(true)}
                        onMouseLeave={() => setMoreDropdownOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 flex items-center justify-center dark:text-white bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent"
                        >
                          <MoreHorizontal className="h-6 w-6" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[80px] p-2 border border-gray-200 dark:border-gray-800 shadow-sm"
                        onMouseEnter={() => setMoreDropdownOpen(true)}
                        onMouseLeave={() => setMoreDropdownOpen(false)}
                      >
                        {more.map((item, index) => (
                          <DropdownMenuItem
                            key={item.title}
                            asChild
                            className={cn(
                              "py-2 text-md font-normal text-center dark:text-white",
                              index === 1 ? "border-b border-gray-200 dark:border-gray-800 pb-2 mb-1" : "",
                            )}
                          >
                            <Link href={item.href}>{item.title}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right side controls */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            {/* Theme Switcher */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 dark:text-gray-400" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle theme"
                className="ring-0"
              />
              <Moon className="h-4 w-4 text-gray-400 dark:text-white" />
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1 h-10 flex items-center dark:text-white bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent">
                  <Globe className="h-4 w-4" />
                  <span className="text-md">{getCurrentLanguageDisplay()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[160px] border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-0">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center dark:text-white",
                        lang.code === language ? "bg-muted dark:bg-gray-800" : "",
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {lang.code === language && (
                        <svg
                          className="ml-auto h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="default" className="rounded-lg h-10 flex items-center">
              Contact Us
            </Button>
          </div>

          {/* Mobile menu button - removed hamburger menu */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Theme Switcher for Mobile */}
            <div className="flex items-center">
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle theme"
                className="ring-0"
              />
              {isDarkMode ? <Moon className="h-4 w-4 ml-1 text-white" /> : <Sun className="h-4 w-4 ml-1" />}
            </div>

            {/* Language Switcher for Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1 h-8 flex items-center dark:text-white">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">{getCurrentLanguageDisplay()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[160px] border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-0">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center dark:text-white",
                        lang.code === language ? "bg-muted dark:bg-gray-800" : "",
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {lang.code === language && (
                        <svg
                          className="ml-auto h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 lg:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onMouseEnter={() => setMobileProductsOpen(true)}
            onMouseLeave={() => setMobileProductsOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full",
              mobileProductsOpen
                ? "text-black dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-" />
            </svg>
            <span className="text-xs">Products</span>
          </button>
          <button
            onMouseEnter={() => setMobileIndustriesOpen(true)}
            onMouseLeave={() => setMobileIndustriesOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full",
              mobileIndustriesOpen
                ? "text-black dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1"
            >
              <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            </svg>
            <span className="text-xs">Industries</span>
          </button>
          <Link
            href="/solutions"
            className="flex flex-col items-center justify-center w-1/5 h-full text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1"
            >
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
            <span className="text-xs">Solutions</span>
          </Link>
          <Link
            href="/pricing"
            className="flex flex-col items-center justify-center w-1/5 h-full text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-xs">Pricing</span>
          </Link>

          <DropdownMenu open={mobileModeDropdownOpen} onOpenChange={setMobileModeDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center w-1/5 h-full text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-1"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
                <span className="text-xs">More</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-[120px] p-2 border border-gray-200 dark:border-gray-800 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 animate-fadeInUp mr-3"
              onMouseLeave={() => setMobileModeDropdownOpen(false)}
            >
              {more.map((item, index) => (
                <DropdownMenuItem
                  key={item.title}
                  asChild
                  className={cn(
                    "py-2 text-xs font-normal text-center dark:text-white",
                    index === 1 ? "border-b border-gray-200 dark:border-gray-800 pb-2 mb-1" : "",
                  )}
                >
                  <Link href={item.href}>{item.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Products Card */}
      {mobileProductsOpen && (
        <div
          className="fixed bottom-16 left-5 z-[90] max-w-[70%] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg lg:hidden animate-fadeInUp"
          onMouseEnter={() => setMobileProductsOpen(true)}
          onMouseLeave={() => setMobileProductsOpen(false)}
        >
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.title}
                  href={product.href}
                  className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                >
                  {/* SVG Icon on Left */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="w-6 h-6 text-gray-700 dark:text-gray-300">{product.icon}</div>
                  </div>
                  {/* Title on Right */}
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{product.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {mobileIndustriesOpen && (
        <div
          className="fixed bottom-16 left-5 z-[90] max-w-[70%] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg lg:hidden animate-fadeInUp"
          onMouseEnter={() => setMobileIndustriesOpen(true)}
          onMouseLeave={() => setMobileIndustriesOpen(false)}
        >
          <div className="p-3">
            <div className="grid grid-cols-1 gap-3">
              {industries.map((industry) => (
                <Link
                  key={industry.title}
                  href={industry.href}
                  className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                >
                  {/* SVG Icon on Left */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="w-6 h-6 text-gray-700 dark:text-gray-300">{industry.icon}</div>
                  </div>
                  {/* Title on Right */}
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{industry.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}