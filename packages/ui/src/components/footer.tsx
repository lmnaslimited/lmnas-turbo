"use client"

import Link from "next/link"
import { type ReactElement } from "react"
import * as React from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Twitter, Linkedin, Mail, Phone, MapPin, Youtube, Globe } from "lucide-react"
import { TfooterTarget } from "@repo/middleware/types";
import { ThemeToggle } from "./theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@repo/ui/lib/utils"
import { NewsletterSubscriptionForm } from "./subscription"

// Map of icon names to their components
const LdIconMap = {
  Twitter: Twitter,
  Linkedin: Linkedin,
  Youtube: Youtube,
  Mail: Mail,
  Phone: Phone,
  MapPin: MapPin,
} as const

type IconKey = keyof typeof LdIconMap

export default function Footer({ idFooter }: { idFooter: TfooterTarget }): ReactElement {
  const [Language, fnSetLanguage] = React.useState("en") //Maintain Language state
  const LaRouter = useRouter() // Router instance for navigation
  const LPathname = usePathname() // Get current pathname (e.g., /en/trending-now)
  // Sync language from URL path (middleware-like behavior)
  React.useEffect(() => {
    // Extract language code from URL (e.g., "en" from /en/...)
    const LCurrentLang = LPathname.split("/")[1]
    fnSetLanguage(LCurrentLang ?? "EN")
  }, [LPathname])

  // Handle language switch and update route accordingly
  const fnHandleLanguageChange = (iNewLang: string) => {
    // Split current path into segments
    const LSegments = LPathname.split("/")
    LSegments[1] = iNewLang // replace language segment
     // Rebuild updated path
    const NewPath = LSegments.join("/")
    fnSetLanguage(iNewLang)  // Update language state
    LaRouter.push(NewPath) // navigate to new lang route
  }
  // Get current language label for display (e.g., "EN")
  const fnGetCurrentLanguageDisplay = (): string => {
    // Find matching language from footer config
    const LCurrentLang = idFooter.footer.language.find(
      (idLang) => idLang.label === Language
    )
    // Return uppercase label or fallback to "EN"
    return LCurrentLang && LCurrentLang.label
      ? LCurrentLang.label.toUpperCase()
      : "EN"
  }

  return (
    <footer className="bg-muted/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <span className="font-bold text-2xl text-foreground">
                {idFooter.footer.companyName}
              </span>
            </Link>
            <p className="text-primary/70 mb-6">{idFooter.footer.companyInfo}</p>
            <div className="flex space-x-4">
              {idFooter.footer.social.map((idItem) => {
                const IconComponent = LdIconMap[idItem.icon as IconKey]
                return (
                  <Link
                    key={idItem.label}
                    href={idItem.href!}
                    className="text-primary/70 hover:text-primary transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="sr-only">{idItem.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{idFooter.footer.menu[0]?.label}</h3>
            <ul className="space-y-3">
              {idFooter.footer.product.map((idItem) => (
                <li key={idItem.label}>
                  <Link href={idItem.href!} className="text-primary/70 hover:text-primary transition-colors">
                    {idItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{idFooter.footer.menu[1]?.label}</h3>
            <ul className="space-y-3">
              {idFooter.footer.more.map((idItem) => (
                <li key={idItem.label}>
                  <Link href={idItem.href!} className="text-primary/70 hover:text-primary transition-colors">
                    {idItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{idFooter.footer.menu[2]?.label}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary/70 mr-2 mt-0.5" />
                <span className="text-primary/70">{idFooter.footer.contact.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary/70 mr-2" />
                <Link
                  href={`tel:${idFooter.footer.contact.phoneHref}`}
                  className="text-primary/70 hover:text-primary transition-colors"
                >
                  {idFooter.footer.contact.phoneLabel}
                </Link>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary/70 mr-2" />
                <Link
                  href={`mailto:${idFooter.footer.contact.emailHref}`}
                  className="text-primary/70 hover:text-primary transition-colors"
                >
                  {idFooter.footer.contact.emailLabel}
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">{idFooter.footer.menu[3]?.label}</h4>
              <NewsletterSubscriptionForm
                placeholder={idFooter.footer.menu[4]?.label ?? ""}
                buttonLabel={String(idFooter.footer.menu[4]?.icon ?? "Subscribe")}
                buttonPendingLabel={idFooter.footer.menu[4]?.description ?? "Subscribing..."}
                variant="sm"
                source="footer-newsletter"
              />
            </div>
          </div>
          {/* Mobile menu button - removed hamburger menu */}
          <div className="flex lg:hidden gap-2 mt-4">
              {/* Theme Switcher for Mobile */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>

              {/* Language Switcher for Mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-8 flex items-center "
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-xs">
                      {fnGetCurrentLanguageDisplay()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[160px] border border-border shadow-sm"
                >
                  <div className="grid grid-cols-1 gap-0">
                    {idFooter.footer.language.map((idLang) => (
                      <DropdownMenuItem
                        key={idLang.label ?? "EN"}
                        // onClick={() => fnSetLanguage(idLang.label ?? "EN")}
                        onClick={() =>
                          fnHandleLanguageChange(idLang.label ?? "EN")
                        }
                        className={cn(
                          "flex items-center py-2 px-2 text-md font-normal text-center ",
                          idLang.label === Language ? "bg-muted " : ""
                        )}
                      >
                        <span className="flex items-center justify-center w-6 h-6 text-base">
                          {idLang.icon}
                        </span>
                        <span>{idLang.description}</span>
                        {idLang.label === Language && (
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

        <div className="border-t border-border pt-8 pb-16 sm:pb-0">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-primary/70 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {idFooter.footer.companyName}. {idFooter.footer.menu[5]?.label}
            </p>
            <div className="flex space-x-6">
              {idFooter.footer.policies.map((idItem) => (
                <Link
                  key={idItem.label}
                  href={`${idItem.href!}`}
                  className="text-sm text-primary/70 hover:text-primary transition-colors"
                >
                  {idItem.label}
                </Link>
              ))}
            </div>
            {/* Theme Switcher */}
            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <ThemeToggle />
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-10 flex items-center  bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-md">
                      {fnGetCurrentLanguageDisplay()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[160px] border border-border  shadow-sm"
                >
                  <div className="grid grid-cols-1 gap-0">
                    {idFooter.footer.language.map((idLang) => (
                      <DropdownMenuItem
                        key={idLang.label ?? "EN"}
                        onClick={() =>
                          fnHandleLanguageChange(idLang.label ?? "EN")
                        }
                        className={cn(
                          "flex items-center py-2 px-2 text-md font-normal text-center ",
                          idLang.label === Language ? "bg-muted " : ""
                        )}
                      >
                        <span className="flex items-center justify-center w-6 h-6 text-base">
                          {idLang.icon}
                        </span>
                        <span>{idLang.description}</span>
                        {idLang.label === Language && (
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
        </div>
      </div>
    </footer>
  )
}