"use client"

import * as React from "react"
import Link from "next/link"
import { Globe, MoreHorizontal } from "lucide-react"

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
import { ThemeToggle } from "@repo/ui/components/theme-toggle"
import { SVGComponent } from "@repo/ui/svg/svgs"

const LaProducts = [
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
  // {
  //   title: "CPQ Cloud",
  //   href: "/products/cpq-cloud",
  //   description: "SaaS solution designed to assist businesses",
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <path d="M7 21a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v16Z" />
  //       <path d="M12 10h.01" />
  //     </svg>
  //   ),
  // },
  // {
  //   title: "CRM Cloud",
  //   href: "/products/crm-cloud",
  //   description: "Empowering Your Customer Relationship Management",
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <path d="M14 19a6 6 0 0 0-12 0" />
  //       <circle cx="8" cy="9" r="4" />
  //       <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
  //     </svg>
  //   ),
  // },
  // {
  //   title: "LUMI",
  //   href: "/products/lumi",
  //   description: "Our Smart Assistant for Effortless Management",
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <circle cx="12" cy="12" r="10" />
  //       <path d="M12 16v-4" />
  //       <path d="M12 8h.01" />
  //     </svg>
  //   ),
  // },
  {
    title: "HRMS Cloud",
    href: "/products/hrms-cloud",
    description: "Transforming Human Resource Management in the Digital Era",
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  // {
  //   title: "Analytical Cloud",
  //   href: "/products/analytical-cloud",
  //   description: "Streamline Your Business with Analytics Cloud",
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <path d="M3 3v18h18" />
  //       <path d="m19 9-5 5-4-4-3 3" />
  //     </svg>
  //   ),
  // },
]

const LaIndustries = [
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

const LaMore = [
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
    href: "/careers",
  },
  {
    title: "Trending",
    href: "/trending-now",
  },
]

const LaLanguages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
]

export default function Navbar(): React.ReactElement {
  const [Language, fnSetLanguage] = React.useState("en")
  const [MoreDropdownOpen, fnSetMoreDropdownOpen] = React.useState(false)
  const [IsScrolled, fnSetIsScrolled] = React.useState(false)
  const [MobileProductsOpen, fnSetMobileProductsOpen] = React.useState(false)
  const [MobileIndustriesOpen, fnSetMobileIndustriesOpen] = React.useState(false)
  const [MobileModeDropdownOpen, fnSetMobileModeDropdownOpen] = React.useState(false)

  // Handle scroll effect
  React.useEffect(() => {
    const fnHandleScroll = (): void => { //only update no return
      if (window.scrollY > 10) {
        fnSetIsScrolled(true)
      } else {
        fnSetIsScrolled(false)
      }
    }

    window.addEventListener("scroll", fnHandleScroll)
    return () => {
      window.removeEventListener("scroll", fnHandleScroll)
    }
  }, [])

  // Get current language display
  const fnGetCurrentLanguageDisplay = (): string => {
    const CurrentLang = LaLanguages.find((idLang) => idLang.code === Language)
    return CurrentLang ? CurrentLang.code.toUpperCase() : "EN"
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border ",
          IsScrolled ? "bg-background/80 backdrop-blur-md " : "bg-transparent ",
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-dark rounded-md flex items-center justify-center text-primary-foreground">
                <SVGComponent />
              </div>
              <span className="text-lg font-bold tracking-tight ">LMNAs</span>
            </Link>

            {/* Desktop Navigation - Left aligned on large screens, centered on medium */}
            <div className="hidden lg:flex lg:items-center">
              <NavigationMenu className="md:justify-center">
                <NavigationMenuList className="flex items-center">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-md flex items-center  transition-transform duration-200 hover:scale-105">
                      Products
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-border  shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2">
                          {LaProducts.map((idProduct) => (
                            <Link href={idProduct.href} key={idProduct.title}>
                              <div className="flex items-start gap-2 transition-transform duration-200 hover:scale-105">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 ">
                                  <div className="w-6 h-6 flex items-center justify-center">{idProduct.icon}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">{idProduct.title}</span>
                                  <p className="text-xs text-muted-foreground ">{idProduct.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-md flex items-center h-10  transition-transform duration-200 hover:scale-105">
                      Industries
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-border  shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2">
                          {LaIndustries.map((idIndustry) => (
                            <Link href={idIndustry.href} key={idIndustry.title}>
                              <div
                                key={idIndustry.title}
                                className="flex items-start gap-2 transition-transform duration-200 hover:scale-105"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 ">
                                  <div className="w-6 h-6 flex items-center justify-center">{idIndustry.icon}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">{idIndustry.title}</span>
                                  <p className="text-xs text-muted-foreground ">{idIndustry.description}</p>
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
                          "text-md h-10 flex items-center  transition-transform duration-200 hover:scale-105",
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
                          "text-md h-10 flex items-center  transition-transform duration-200 hover:scale-105",
                        )}
                      >
                        Pricing
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 flex items-center justify-center bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent"
                        >
                          <MoreHorizontal className="h-6 w-6" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[80px] p-2 border border-border shadow-sm"
                      >
                        {LaMore.map((idItem, iIndex) => (
                          <DropdownMenuItem
                            key={idItem.title}
                            asChild
                            className={cn(
                              "py-2 text-md font-normal text-center ",
                              iIndex === 1 ? "border-b border-border  pb-2 mb-1" : "",
                            )}
                          >
                            <Link href={idItem.href}>{idItem.title}</Link>
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

              <ThemeToggle />
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1 h-10 flex items-center  bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent">
                  <Globe className="h-4 w-4" />
                  <span className="text-md">{fnGetCurrentLanguageDisplay()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[160px] border border-border  shadow-sm"
              >
                <div className="grid grid-cols-1 gap-0">
                  {LaLanguages.map((idLang) => (
                    <DropdownMenuItem
                      key={idLang.code}
                      onClick={() => fnSetLanguage(idLang.code)}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center ",
                        idLang.code === Language ? "bg-muted " : "",
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">{idLang.flag}</span>
                      <span>{idLang.name}</span>
                      {idLang.code === Language && (
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

              <ThemeToggle />
            </div>

            {/* Language Switcher for Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1 h-8 flex items-center ">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">{fnGetCurrentLanguageDisplay()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[160px] border border-border shadow-sm"
              >
                <div className="grid grid-cols-1 gap-0">
                  {LaLanguages.map((idLang) => (
                    <DropdownMenuItem
                      key={idLang.code}
                      onClick={() => fnSetLanguage(idLang.code)}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center ",
                        idLang.code === Language ? "bg-muted " : "",
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">{idLang.flag}</span>
                      <span>{idLang.name}</span>
                      {idLang.code === Language && (
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
      <div className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md bg-background/80  border-t border-border  lg:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onMouseEnter={() => fnSetMobileProductsOpen(true)}
            onMouseLeave={() => fnSetMobileProductsOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full",
              MobileProductsOpen
                ? "text-primary "
                : "text-muted-foreground  hover:text-primary ",
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
            onMouseEnter={() => fnSetMobileIndustriesOpen(true)}
            onMouseLeave={() => fnSetMobileIndustriesOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full",
              MobileIndustriesOpen
                ? "text-primary "
                : "text-muted-foreground  hover:text-primary ",
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
            className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground  hover:text-primary "
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
            className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground  hover:text-primary "
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

          <DropdownMenu open={MobileModeDropdownOpen} onOpenChange={fnSetMobileModeDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground  hover:text-black  bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent">
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
              className="w-[120px] p-2 border border-border  backdrop-blur-md bg-background/80  animate-fadeInUp mr-3"
              onMouseLeave={() => fnSetMobileModeDropdownOpen(false)}
            >
              {LaMore.map((idItem, iIndex) => (
                <DropdownMenuItem
                  key={idItem.title}
                  asChild
                  className={cn(
                    "py-2 text-xs font-normal text-center ",
                    iIndex === 1 ? "border-b border-border pb-2 mb-1" : "",
                  )}
                >
                  <Link href={idItem.href}>{idItem.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Products Card */}
      {MobileProductsOpen && (
        <div
          className="fixed bottom-16 left-5 z-[90] max-w-[70%] bg-grayBackground  border border-border  rounded-lg lg:hidden animate-fadeInUp"
          onMouseEnter={() => fnSetMobileProductsOpen(true)}
          onMouseLeave={() => fnSetMobileProductsOpen(false)}
        >
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {LaProducts.slice(0, 6).map((idProduct) => (
                <Link
                  key={idProduct.title}
                  href={idProduct.href}
                  className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                >
                  {/* SVG Icon on Left */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border  flex-shrink-0">
                    <div className="w-6 h-6 text-primary/70 ">{idProduct.icon}</div>
                  </div>
                  {/* Title on Right */}
                  <span className="text-xs font-medium text-primary ">{idProduct.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {MobileIndustriesOpen && (
        <div
          className="fixed bottom-16 left-5 z-[90] max-w-[70%] bg-grayBackground  border border-border  rounded-lg lg:hidden animate-fadeInUp"
          onMouseEnter={() => fnSetMobileIndustriesOpen(true)}
          onMouseLeave={() => fnSetMobileIndustriesOpen(false)}
        >
          <div className="p-3">
            <div className="grid grid-cols-1 gap-3">
              {LaIndustries.map((idIndustry) => (
                <Link
                  key={idIndustry.title}
                  href={idIndustry.href}
                  className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                >
                  {/* SVG Icon on Left */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border flex-shrink-0">
                    <div className="w-6 h-6 text-primary/70 ">{idIndustry.icon}</div>
                  </div>
                  {/* Title on Right */}
                  <span className="text-xs font-medium text-primary ">{idIndustry.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}