"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@repo/ui/lib/utils"
import { SVGComponent } from "@repo/ui/svg/svgs"
import { getIconComponent } from "@repo/ui/lib/icon"
import { MoreHorizontal, Globe } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/ui/navigation-menu"
import type { TnavbarTarget, Tbutton } from "@repo/middleware/types"
import { useAuth } from "./auth/authContext"
import { ProfileDropdown } from "./profile"

export default function Navbar({
  idNavbar,
}: {
  idNavbar: TnavbarTarget
}): React.ReactElement {

  const { user, loading, logout } = useAuth();
  
  const [LMobileProductsOpen, fnSetMobileProductsOpen] = React.useState(false)
  const [LMobileIndustriesOpen, fnSetMobileIndustriesOpen] =
    React.useState(false)
  const [LMobileModeDropdownOpen, fnSetMobileModeDropdownOpen] =
    React.useState(false)
  const [LDesktopMenuOpen, fnSetDesktopMenuOpen] = React.useState<
    string | undefined
  >(undefined)

  const fnRenderIcon = (iIcon: Tbutton["icon"]) => {
    const iconName = typeof iIcon === "string" ? iIcon : "HelpCircle"
    const IconComponent = getIconComponent(iconName)
    return <IconComponent className="w-6 h-6" />
  }

  React.useEffect(() => {
    const fnHandleScroll = () => {
      fnSetMobileProductsOpen(false)
      fnSetMobileIndustriesOpen(false)
      fnSetMobileModeDropdownOpen(false)
    }

    const fnHandleClickOutside = (idevent: MouseEvent | TouchEvent) => {
      const Target = idevent.target as HTMLElement
      if (!Target.closest(".mobile-dropdown")) {
        fnSetMobileProductsOpen(false)
        fnSetMobileIndustriesOpen(false)
        fnSetMobileModeDropdownOpen(false)
      }
    }

    window.addEventListener("scroll", fnHandleScroll, { passive: true })
    window.addEventListener("click", fnHandleClickOutside)
    window.addEventListener("touchstart", fnHandleClickOutside)

    return () => {
      window.removeEventListener("scroll", fnHandleScroll)
      window.removeEventListener("click", fnHandleClickOutside)
      window.removeEventListener("touchstart", fnHandleClickOutside)
    }
  }, [])

  // Get the Sign In label form dumps
  // the one with no href and icon
  const LdSignInItem = idNavbar.navbar.menu.find(
    (idItem) => !idItem.href && !idItem.icon
  );

  return (
    <>
      <header className={cn("sticky top-0 z-50 w-full bg-background")}>
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            {/* Logo and Brand */}
            <Link
              href={idNavbar.navbar.logo.href ?? "/"}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center text-white">
                <SVGComponent />
              </div>
              <span className="text-lg font-bold tracking-tight ">
                {idNavbar.navbar.logo.label}
              </span>
            </Link>

            {/* Desktop Navigation - Left aligned on large screens, centered on medium */}
            <div className="hidden lg:flex lg:items-center">
              <NavigationMenu
                value={LDesktopMenuOpen}
                onValueChange={fnSetDesktopMenuOpen}
                className="md:justify-center"
              >
                <NavigationMenuList className="flex items-center">
                  <NavigationMenuItem value="products">
                    <NavigationMenuTrigger className="text-md flex items-center transition-transform duration-200 hover:scale-105">
                      {idNavbar.navbar.menu[0]?.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-border  shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {idNavbar.navbar.product.map((idProduct) => (
                            <Link
                              href={idProduct.href ?? '#'}
                              key={idProduct.label}
                              onClick={() => fnSetDesktopMenuOpen(undefined)}
                            >
                              <div className="flex items-start gap-2 transition-transform duration-200 hover:scale-105">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 ">
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    {fnRenderIcon(idProduct.icon)}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">
                                    {idProduct.label}
                                  </span>
                                  <p className="text-xs text-muted-foreground ">
                                    {idProduct.description}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {(idNavbar.navbar.accelerator?.length ?? 0) > 0 && (
                          <>
                            <hr />
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              {idNavbar.navbar.accelerator?.map(
                                (idAccelerator) => (
                                  <Link
                                    href={idAccelerator.href ?? '#'}
                                    key={idAccelerator.label}
                                    onClick={() =>
                                      fnSetDesktopMenuOpen(undefined)
                                    }
                                  >
                                    <div className="flex items-start gap-2 transition-transform duration-200 hover:scale-105">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                                        <div className="flex h-6 w-6 items-center justify-center">
                                          {fnRenderIcon(idAccelerator.icon)}
                                        </div>
                                      </div>

                                      <div>
                                        <span className="text-md font-medium">
                                          {idAccelerator.label}
                                        </span>

                                        <p className="text-xs text-muted-foreground">
                                          {idAccelerator.description}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                ),
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem value="industries">
                    <NavigationMenuTrigger className="text-md flex items-center h-10  transition-transform duration-200 hover:scale-105">
                      {idNavbar.navbar.menu[1]?.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border border-border  shadow-sm">
                      <div className="p-5 w-[500px]">
                        <div className="grid grid-cols-2 gap-2">
                          {idNavbar.navbar.industry.map((idIndustry) => (
                            <Link
                              href={idIndustry.href!}
                              key={idIndustry.label}
                              onClick={() => fnSetDesktopMenuOpen(undefined)}
                            >
                              <div
                                key={idIndustry.label}
                                className="flex items-start gap-2 transition-transform duration-200 hover:scale-105"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-md  flex-shrink-0 ">
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    {fnRenderIcon(idIndustry.icon)}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">
                                    {idIndustry.label}
                                  </span>
                                  <p className="text-xs text-muted-foreground ">
                                    {idIndustry.description}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link
                      href={idNavbar.navbar.menu[2]?.href!}
                      legacyBehavior
                      passHref
                    >
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
                    <Link
                      href={idNavbar.navbar.menu[3]?.href!}
                      legacyBehavior
                      passHref
                    >
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
                          aria-label="More Options"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 flex items-center justify-center bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent"
                        >
                          <MoreHorizontal className="h-6 w-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[80px] p-2 border border-border shadow-sm"
                      >
                        {idNavbar.navbar.more.map((idItem, iIndex) => (
                          <DropdownMenuItem
                            key={idItem.label}
                            asChild
                            className={cn(
                              "py-2 text-md font-normal text-center ",
                              iIndex === 1
                                ? "border-b border-border  pb-2 mb-1"
                                : "",
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
          <div className="lg:flex lg:items-center lg:gap-4">
          {/* Right side controls */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            
            {/* we have consider the menus, with href and without icon to be button */}
            {idNavbar.navbar.menu
              .filter((idItem) => !idItem.icon && idItem.href)
              .map((idItem, iIndex) => (
                <Link key={iIndex} href={idItem.href!}>
                  <Button
                    variant={idItem.variant || "default"}
                    className="rounded-lg h-10 flex items-center"
                  >
                    {idItem.label}
                  </Button>
                </Link>
              ))}
          </div>
          {/* 3. Central Dynamic Auth Render
            last of the menu should be Sign In
           */}
          <div className="flex items-center justify-center gap-2">
              {loading ? (
                /* 2. Sleek inline spinning ring template while validating cookie states */
                
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
               
        ) :user ? (
              <ProfileDropdown user={user} logout={logout} />
            ) : (
              <Link href="/api/auth/login">
                <Button 
                  variant="default"
                  className="rounded-lg h-10 flex items-center"
                >
                {LdSignInItem?.label}
                </Button>
              </Link>
            )}
            </div>
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
            <span className="w-5 h-6 mb-1">
              {fnRenderIcon(idNavbar.navbar.menu[2]?.icon)}
            </span>
            <span className="text-xs">{idNavbar.navbar.menu[2]?.label}</span>
          </Link>

          {/* Products */}
          <div className="mobile-dropdown relative w-1/5 h-full flex items-center justify-center ">
            <button
              onClick={() => {
                fnSetMobileProductsOpen(!LMobileProductsOpen);
                fnSetMobileIndustriesOpen(false);
                fnSetMobileModeDropdownOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                LMobileProductsOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <span className="w-5 h-6 mb-1">
                {fnRenderIcon(idNavbar.navbar.menu[0]?.icon)}
              </span>
              <span className="text-xs ">{idNavbar.navbar.menu[0]?.label}</span>
            </button>
            {LMobileProductsOpen && (
              <div className="fixed bottom-16 left-5 z-[90] max-w-[70%] border border-border rounded-lg lg:hidden animate-fadeInUp bg-background p-3">
                <div className="grid grid-cols-2 gap-2">
                  {idNavbar.navbar.product.slice(0, 6).map((idProduct) => (
                    <Link
                      key={idProduct.label}
                      href={idProduct.href ?? '#'}
                      onClick={() => fnSetMobileProductsOpen(false)}
                      className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                        <div className="w-6 h-6 text-primary/70">
                          {fnRenderIcon(idProduct.icon)}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-primary">
                        {idProduct.label}
                      </span>
                    </Link>
                  ))}
                </div>
                {(idNavbar.navbar.accelerator?.length ?? 0) > 0 && (
                  <>
                    <hr className="my-4" />
                    <div className="grid grid-cols-2 gap-2">
                      {idNavbar.navbar.accelerator?.map((idAccelerator) => (
                        <Link
                          key={idAccelerator.label}
                          href={idAccelerator.href ?? '#'}
                          onClick={() => fnSetMobileProductsOpen(false)}
                          className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                            <div className="w-6 h-6 text-primary/70">
                              {fnRenderIcon(idAccelerator.icon)}
                            </div>
                          </div>

                          <span className="text-xs font-medium text-primary">
                            {idAccelerator.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Industries */}
          <div className="mobile-dropdown relative w-1/5 h-full flex items-center justify-center">
            <button
              onClick={() => {
                fnSetMobileIndustriesOpen(!LMobileIndustriesOpen);
                fnSetMobileProductsOpen(false);
                fnSetMobileModeDropdownOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                LMobileIndustriesOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <span className="w-5 h-6 mb-1">
                {fnRenderIcon(idNavbar.navbar.menu[1]?.icon)}
              </span>
              <span className="text-xs ">{idNavbar.navbar.menu[1]?.label}</span>
            </button>

            {LMobileIndustriesOpen && (
              <div className="fixed bottom-16 left-5 z-[90] max-w-[70%] border border-border rounded-lg lg:hidden animate-fadeInUp bg-background p-3">
                <div className="grid grid-cols-2 gap-2">
                  {idNavbar.navbar.industry.map((idIndustry) => (
                    <Link
                      key={idIndustry.label}
                      href={idIndustry.href!}
                      className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                        <div className="w-6 h-6 text-primary/70">
                          {fnRenderIcon(idIndustry.icon)}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-primary">
                        {idIndustry.label}
                      </span>
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
            <span className="w-5 h-6 mb-1">
              {fnRenderIcon(idNavbar.navbar.menu[3]?.icon)}
            </span>
            <span className="text-xs">{idNavbar.navbar.menu[3]?.label}</span>
          </Link>

          {/* More Dropdown */}
          <div className="mobile-dropdown relative w-1/5 h-full flex items-center justify-center">
            <button
              onClick={() => {
                fnSetMobileModeDropdownOpen(!LMobileModeDropdownOpen);
                fnSetMobileProductsOpen(false);
                fnSetMobileIndustriesOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                LMobileModeDropdownOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <span className="w-5 h-6 mb-1">
                {fnRenderIcon(idNavbar.navbar.menu[4]?.icon)}
              </span>
              <span className="text-xs">{idNavbar.navbar.menu[4]?.label}</span>
            </button>

            {LMobileModeDropdownOpen && (
              <div className="fixed bottom-16 right-3 z-[90] w-[120px] bg-background border border-border rounded-lg lg:hidden animate-fadeInUp p-2">
                {idNavbar.navbar.more.map((idItem, iIndex) => (
                  <div
                    key={idItem.label}
                    className={cn(
                      "py-2 text-sm font-normal text-center",
                      iIndex === 1 ? "border-b border-border pb-2 mb-1" : "",
                    )}
                  >
                    <Link
                      href={idItem.href!}
                      onClick={() => fnSetMobileModeDropdownOpen(false)}
                      className="block w-full text-primary"
                    >
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
  );
}
