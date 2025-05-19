"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@repo/ui/components/theme-toggle"
import { Button } from "@repo/ui/components/ui/button"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`w-full py-4 transition-all duration-300 z-50 ${isScrolled ? "sticky top-0 bg-background/95 backdrop-blur-sm shadow-sm" : ""
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            LMNAs
          </span>
          <span className="hidden sm:inline-block font-medium">Cloud Solutions</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/industries" className="font-medium hover:text-primary transition-colors">
            Industries
          </Link>
          <Link href="/solutions" className="font-medium hover:text-primary transition-colors">
            Solutions
          </Link>
          <Link href="/pricing" className="font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#contact" className="font-medium hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="/blog" className="font-medium hover:text-primary transition-colors">
            Blog
          </Link>
          <ThemeToggle />
          <Button size="sm" className="ml-4">
            Get Started
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b z-50 animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/industries"
              className="font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Industries
            </Link>
            <Link
              href="/solutions"
              className="font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Solutions
            </Link>
            <Link
              href="/pricing"
              className="font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              pricing
            </Link>
            <Link
              href="#contact"
              className="font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/blog"
              className="font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Button size="sm" className="w-full">
              Get Started
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

