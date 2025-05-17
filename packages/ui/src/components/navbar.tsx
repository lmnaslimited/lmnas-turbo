"use client"
import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@repo/ui/components/ui/navigation-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu"
import { ThemeToggle } from "@repo/ui/components/theme-toggle"
import { SVGComponent } from "@repo/ui/svg/svgs"
import { getIconComponent } from "@repo/ui/lib/icon"
import type { TnavbarTarget, Tbutton } from "@repo/middleware"
import { MoreHorizontal, Globe } from "lucide-react"

export default function Navbar({ idNavbar }: { idNavbar: TnavbarTarget }): React.ReactElement {
  const [Language, fnSetLanguage] = React.useState("en")
  const [IsScrolled, fnSetIsScrolled] = React.useState(false)
  const [MobileProductsOpen, fnSetMobileProductsOpen] = React.useState(false)
  const [MobileIndustriesOpen, fnSetMobileIndustriesOpen] = React.useState(false)
  const [MobileModeDropdownOpen, fnSetMobileModeDropdownOpen] = React.useState(false)
  const router = useRouter();
  const pathname = usePathname();

  const renderIcon = (icon: Tbutton['icon']) => {
    const iconName = typeof icon === "string" ? icon : "HelpCircle";
    const IconComponent = getIconComponent(iconName);
    return <IconComponent className="w-6 h-6" />;
  };

  //middleware
  React.useEffect(() => {
    const currentLang = pathname.split('/')[1]; // get "en" from /en/trending-now
    fnSetLanguage(currentLang ?? "EN");
  }, [pathname]);

  const handleLanguageChange = (newLang: string) => {
    const segments = pathname.split('/');
    segments[1] = newLang; // replace language segment
    const newPath = segments.join('/');
    fnSetLanguage(newLang);
    router.push(newPath); // navigate to new lang route
  };

  React.useEffect(() => {
    const handleScroll = () => {
      fnSetMobileProductsOpen(false)
      fnSetMobileIndustriesOpen(false)
      fnSetMobileModeDropdownOpen(false)
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.mobile-dropdown')) {
        fnSetMobileProductsOpen(false)
        fnSetMobileIndustriesOpen(false)
        fnSetMobileModeDropdownOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('click', handleClickOutside)
    window.addEventListener('touchstart', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('click', handleClickOutside)
      window.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])



  const fnGetCurrentLanguageDisplay = (): string => {
    const CurrentLang = idNavbar.navbar.language.find((idLang) => idLang.label === Language)
    return CurrentLang && CurrentLang.label ? CurrentLang.label.toUpperCase() : "EN";
  }
  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-background",
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            {/* Logo and Brand */}
            <Link href={idNavbar.navbar.logo.href ?? "/"} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center text-white">
                <SVGComponent />
              </div>
              <span className="text-lg font-bold tracking-tight ">{idNavbar.navbar.logo.label}</span>
            </Link>

            {/* Desktop Navigation - Left aligned on large screens, centered on medium */}
            <div className="hidden lg:flex lg:items-center">
              <NavigationMenu className="md:justify-center">
                <NavigationMenuList className="flex items-center">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-md flex items-center transition-transform duration-200 hover:scale-105">
                      {idNavbar.navbar.menu[0]?.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-border  shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2">
                          {idNavbar.navbar.product.map((idProduct) => (
                            <Link href={idProduct.href!} key={idProduct.label}>
                              <div className="flex items-start gap-2 transition-transform duration-200 hover:scale-105">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 ">
                                  <div className="w-6 h-6 flex items-center justify-center">{renderIcon(idProduct.icon)}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">{idProduct.label}</span>
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
                      {idNavbar.navbar.menu[1]?.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-border  shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2">
                          {idNavbar.navbar.industry.map((idIndustry) => (
                            <Link href={idIndustry.href!} key={idIndustry.label}>
                              <div
                                key={idIndustry.label}
                                className="flex items-start gap-2 transition-transform duration-200 hover:scale-105"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 ">
                                  <div className="w-6 h-6 flex items-center justify-center">{renderIcon(idIndustry.icon)}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">{idIndustry.label}</span>
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
                    <Link href={idNavbar.navbar.menu[2]?.href!} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-md h-10 flex items-center  transition-transform duration-200 hover:scale-105",
                        )}
                      >
                        {idNavbar.navbar.menu[2]?.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link href={idNavbar.navbar.menu[3]?.href!} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-md h-10 flex items-center  transition-transform duration-200 hover:scale-105",
                        )}
                      >
                        {idNavbar.navbar.menu[3]?.label}
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
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[80px] p-2 border border-border shadow-sm">
                        {idNavbar.navbar.more.map((idItem, iIndex) => (
                          <DropdownMenuItem
                            key={idItem.label}
                            asChild
                            className={cn(
                              "py-2 text-md font-normal text-center ",
                              iIndex === 1 ? "border-b border-border  pb-2 mb-1" : "",
                            )}
                          >
                            <Link href={idItem.href!}>{idItem.label}</Link>
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
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 h-10 flex items-center  bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-md">{fnGetCurrentLanguageDisplay()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px] border border-border  shadow-sm">
                <div className="grid grid-cols-1 gap-0">
                  {idNavbar.navbar.language.map((idLang) => (
                    <DropdownMenuItem
                      key={idLang.label ?? "EN"}
                      // onClick={() => fnSetLanguage(idLang.label ?? "EN")}
                      onClick={() => handleLanguageChange(idLang.label ?? "EN")}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center ",
                        idLang.label === Language ? "bg-muted " : "",
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">{idLang.icon}</span>
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
            <Link href={idNavbar.navbar.menu[5]?.href!}>
              <Button variant="default" className="rounded-lg h-10 flex items-center">
                {idNavbar.navbar.menu[5]?.label}
              </Button>
            </Link>
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
              <DropdownMenuContent align="end" className="w-[160px] border border-border shadow-sm">
                <div className="grid grid-cols-1 gap-0">
                  {idNavbar.navbar.language.map((idLang) => (
                    <DropdownMenuItem
                      key={idLang.label ?? "EN"}
                      // onClick={() => fnSetLanguage(idLang.label ?? "EN")}
                      onClick={() => handleLanguageChange(idLang.label ?? "EN")}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center ",
                        idLang.label === Language ? "bg-muted " : "",
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">{idLang.icon}</span>
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
      </header>



   {/* Mobile Bottom Navigation */}
   <div className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md bg-background border-t border-border lg:hidden">
        <div className="flex justify-around items-center h-16 px-2">

          {/* Menu Item */}
          <Link
            href={idNavbar.navbar.menu[2]?.href!}
            className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground hover:text-primary"
          >
            <span className="w-5 h-6 mb-1">{renderIcon(idNavbar.navbar.menu[2]?.icon)}</span>
            <span className="text-xs">{idNavbar.navbar.menu[2]?.label}</span>
          </Link>
         
          {/* Products */}
          <div className="mobile-dropdown relative w-1/5 h-full flex items-center justify-center ">
            <button
              onClick={() => {
                fnSetMobileProductsOpen(!MobileProductsOpen)
                fnSetMobileIndustriesOpen(false)
                fnSetMobileModeDropdownOpen(false)
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                MobileProductsOpen ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <span className="w-5 h-6 mb-1">{renderIcon(idNavbar.navbar.menu[0]?.icon)}</span>
              <span className="text-xs ">{idNavbar.navbar.menu[0]?.label}</span>
            </button>
            {MobileProductsOpen && (
              <div className="fixed bottom-16 left-5 z-[90] max-w-[70%] border border-border rounded-lg lg:hidden animate-fadeInUp bg-background p-3">
                <div className="grid grid-cols-2 gap-2">
                  {idNavbar.navbar.product.slice(0, 6).map((idProduct) => (
                    <Link
                      key={idProduct.label}
                      href={idProduct.href!}
                      className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                        <div className="w-6 h-6 text-primary/70">{renderIcon(idProduct.icon)}</div>
                      </div>
                      <span className="text-xs font-medium text-primary">{idProduct.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Industries */}
          <div className="mobile-dropdown relative w-1/5 h-full flex items-center justify-center">
            <button
              onClick={() => {
                fnSetMobileIndustriesOpen(!MobileIndustriesOpen)
                fnSetMobileProductsOpen(false)
                fnSetMobileModeDropdownOpen(false)
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                MobileIndustriesOpen ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <span className="w-5 h-6 mb-1">{renderIcon(idNavbar.navbar.menu[1]?.icon)}</span>
              <span className="text-xs ">{idNavbar.navbar.menu[1]?.label}</span>
            </button>

            {MobileIndustriesOpen && (
              <div className="fixed bottom-16 left-5 z-[90] max-w-[70%] border border-border rounded-lg lg:hidden animate-fadeInUp bg-background p-3">
                <div className="grid grid-cols-2 gap-2">
                  {idNavbar.navbar.industry.map((idIndustry) => (
                    <Link
                      key={idIndustry.label}
                      href={idIndustry.href!}
                      className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                        <div className="w-6 h-6 text-primary/70">{renderIcon(idIndustry.icon)}</div>
                      </div>
                      <span className="text-xs font-medium text-primary">{idIndustry.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Another menu link */}
          <Link
            href={idNavbar.navbar.menu[3]?.href!}
            className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground hover:text-primary"
          >
            <span className="w-5 h-6 mb-1">{renderIcon(idNavbar.navbar.menu[3]?.icon)}</span>
            <span className="text-xs">{idNavbar.navbar.menu[3]?.label}</span>
          </Link>

          {/* More Dropdown */}
          <div className="mobile-dropdown relative w-1/5 h-full flex items-center justify-center">
            <button
              onClick={() => {
                fnSetMobileModeDropdownOpen(!MobileModeDropdownOpen)
                fnSetMobileProductsOpen(false)
                fnSetMobileIndustriesOpen(false)
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                MobileModeDropdownOpen ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <span className="w-5 h-6 mb-1">{renderIcon(idNavbar.navbar.menu[4]?.icon)}</span>
              <span className="text-xs">{idNavbar.navbar.menu[4]?.label}</span>
            </button>

            {MobileModeDropdownOpen && (
              <div className="fixed bottom-16 right-3 z-[90] w-[120px] bg-background border border-border rounded-lg lg:hidden animate-fadeInUp p-2">
                {idNavbar.navbar.more.map((idItem, iIndex) => (
                  <div
                    key={idItem.label}
                    className={cn(
                      "py-2 text-sm font-normal text-center",
                      iIndex === 1 ? "border-b border-border pb-2 mb-1" : ""
                    )}
                  >
                    <Link href={idItem.href!} className="block w-full text-primary">
                      {idItem.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
