import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                LMNAs
              </span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Empowering businesses to overcome their toughest challenges and unlock growth through innovative AI-driven
              enterprise solutions.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Solutions</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors">
                  LENS ERP Suite
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors">
                  CRM & CPQ
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors">
                  Analytics Cloud
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors">
                  HRMS Cloud
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors">
                  AI-Powered Tools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#case-studies" className="text-muted-foreground hover:text-primary transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="#blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-muted-foreground">123 Enterprise Way, Business District, CA 94105</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <Link href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors">
                  (123) 456-7890
                </Link>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <Link
                  href="mailto:info@lmnas.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  info@lmnas.com
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Subscribe to our newsletter</h4>
              <div className="flex gap-2">
                <Input type="email" placeholder="Your email" className="max-w-xs" />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} LMNAs. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}