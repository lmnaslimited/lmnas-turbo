"use client";

import * as React from "react";
import Link from "next/link";
import {
  BrainCog,
  Briefcase,
  ChartPie,
  Compass,
  DollarSign,
  EllipsisVertical,
  Factory,
  Globe,
  MoreHorizontal,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ThemeToggle } from "@repo/ui/components/theme-toggle";
import { SVGComponent } from "@repo/ui/svg/svgs";

const LaProducts = [
  {
    title: "ERP Suite",
    href: "/products/lens-erp-suite",
    description: "Powering Your Business Operations",
    icon: <Briefcase />,
  },
  {
    title: "CPQ Cloud",
    href: "/products/cpq-cloud",
    description: "SaaS solution designed to assist businesses",
    icon: <BrainCog />,
  },
  {
    title: "CRM Cloud",
    href: "/products/crm-cloud",
    description: "Empowering Your Customer Relationship Management",
    icon:     <Compass />,     
  },
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
    icon: <Users />,
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
];

const LaIndustries = [
  {
    title: "Manufacturing",
    href: "/industries/manufacturing",
    description: "Industrial solutions for factories",
    icon: <Factory />,
  },
  {
    title: "Distribution",
    href: "/industries/distribution",
    description: "Supply chain optimization tools",
    icon: <Truck />,
  },
  {
    title: "Retail",
    href: "/industries/retail",
    description: "Point of sale and inventory management",
    icon: <Store />,
  },
];

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
];

const LaLanguages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  // { code: "fr", name: "Français", flag: "🇫🇷" },
  // { code: "zh", name: "中文", flag: "🇨🇳" },
  // { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

export default function Navbar(): React.ReactElement {
  const [Language, fnSetLanguage] = React.useState("en");
  const [IsScrolled, fnSetIsScrolled] = React.useState(false);
  const [MobileProductsOpen, fnSetMobileProductsOpen] = React.useState(false);
  const [MobileIndustriesOpen, fnSetMobileIndustriesOpen] =
    React.useState(false);
  const [MobileModeDropdownOpen, fnSetMobileModeDropdownOpen] =
    React.useState(false);

  // Handle scroll effect
  React.useEffect(() => {
    const fnHandleScroll = (): void => {
      //only update no return
      if (window.scrollY > 10) {
        fnSetIsScrolled(true);
      } else {
        fnSetIsScrolled(false);
      }
    };

    window.addEventListener("scroll", fnHandleScroll);
    return () => {
      window.removeEventListener("scroll", fnHandleScroll);
    };
  }, []);

  // Get current language display
  const fnGetCurrentLanguageDisplay = (): string => {
    const CurrentLang = LaLanguages.find((idLang) => idLang.code === Language);
    return CurrentLang ? CurrentLang.code.toUpperCase() : "EN";
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border ",
          IsScrolled ? "bg-background/80 backdrop-blur-md " : "bg-transparent "
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
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    {idProduct.icon}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">
                                    {idProduct.title}
                                  </span>
                                  <p className="text-xs text-muted-foreground ">
                                    {idProduct.description}
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
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    {idIndustry.icon}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-md  ">
                                    {idIndustry.title}
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
                    <Link href="/solutions" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-md h-10 flex items-center  transition-transform duration-200 hover:scale-105"
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
                          "text-md h-10 flex items-center  transition-transform duration-200 hover:scale-105"
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
                              iIndex === 1
                                ? "border-b border-border  pb-2 mb-1"
                                : ""
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
                  {LaLanguages.map((idLang) => (
                    <DropdownMenuItem
                      key={idLang.code}
                      onClick={() => fnSetLanguage(idLang.code)}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center ",
                        idLang.code === Language ? "bg-muted " : ""
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">
                        {idLang.flag}
                      </span>
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
            <Link href="/contact">
              <Button
                variant="default"
                className="rounded-lg h-10 flex items-center"
              >
                Contact Us
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
                  {LaLanguages.map((idLang) => (
                    <DropdownMenuItem
                      key={idLang.code}
                      onClick={() => fnSetLanguage(idLang.code)}
                      className={cn(
                        "flex items-center py-2 px-2 text-md font-normal text-center ",
                        idLang.code === Language ? "bg-muted " : ""
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 text-base">
                        {idLang.flag}
                      </span>
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
          <Link
            href="/solutions"
            className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground  hover:text-primary "
          >
            <ChartPie className="w-5 h-6 mb-1" />
            <span className="text-xs">Solutions</span>
          </Link>
          <button
            onMouseEnter={() => fnSetMobileProductsOpen(true)}
            onMouseLeave={() => fnSetMobileProductsOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full",
              MobileProductsOpen
                ? "text-primary "
                : "text-muted-foreground  hover:text-primary "
            )}
          >
            <Briefcase className="w-5 h-6 mb-1" />
            <span className="text-xs">Products</span>
          </button>
          <button
            onMouseEnter={() => fnSetMobileIndustriesOpen(true)}
            onMouseLeave={() => fnSetMobileIndustriesOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full",
              MobileIndustriesOpen
                ? "text-primary "
                : "text-muted-foreground  hover:text-primary "
            )}
          >
            <Factory className="w-5 h-6 mb-1" />
            <span className="text-xs">Industries</span>
          </button>

          <Link
            href="/pricing"
            className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground  hover:text-primary "
          >
            <DollarSign className="w-5 h-6 mb-1" />
            <span className="text-xs">Pricing</span>
          </Link>

          {/* <DropdownMenu open={MobileModeDropdownOpen} onOpenChange={fnSetMobileModeDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center w-1/5 h-full text-muted-foreground  hover:text-black  bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent">
                <EllipsisVertical className="w-5 h-6 mb-1" />
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
                  asChildanimate-fadeInUp
                  className={cn(
                    "py-2 text-xs font-normal text-center ",
                    iIndex === 1 ? "border-b border-border pb-2 mb-1" : "",
                  )}
                >
                  <Link href={idItem.href}>{idItem.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* "More" button */}
          <button
            onMouseEnter={() => fnSetMobileModeDropdownOpen(true)}
            onMouseLeave={() => fnSetMobileModeDropdownOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full",
              MobileModeDropdownOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <EllipsisVertical className="w-5 h-6 mb-1" />
            <span className="text-xs">More</span>
          </button>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                    <div className="w-6 h-6 text-primary/70 ">
                      {idProduct.icon}
                    </div>
                  </div>
                  {/* Title on Right */}
                  <span className="text-xs font-medium text-primary ">
                    {idProduct.title}
                  </span>
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
            <div className="grid grid-cols-2 gap-2">
              {LaIndustries.map((idIndustry) => (
                <Link
                  key={idIndustry.title}
                  href={idIndustry.href}
                  className="flex items-center gap-2 rounded-md transition-transform duration-200 hover:scale-105"
                >
                  {/* SVG Icon on Left */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0">
                    <div className="w-6 h-6 text-primary/70 ">
                      {idIndustry.icon}
                    </div>
                  </div>
                  {/* Title on Right */}
                  <span className="text-xs font-medium text-primary ">
                    {idIndustry.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* "More" dropdown content */}
      {MobileModeDropdownOpen && (
        <div
          className="fixed bottom-16 right-3 z-[90] w-[120px] p-2 bg-grayBackground border border-border rounded-lg lg:hidden animate-fadeInUp"
          onMouseEnter={() => fnSetMobileModeDropdownOpen(true)}
          onMouseLeave={() => fnSetMobileModeDropdownOpen(false)}
        >
          {LaMore.map((idItem, iIndex) => (
            <div
              key={idItem.title}
              className={cn(
                "py-2 text-sm font-normal text-center",
                iIndex === 1 ? "border-b border-border pb-2 mb-1" : ""
              )}
            >
              <Link href={idItem.href} className="block w-full text-primary">
                {idItem.title}
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}