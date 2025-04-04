"use client";
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Twitter, Linkedin, Mail, Phone, MapPin, Youtube } from "lucide-react"
import { ReactElement, useActionState } from "react"
import { subscribeNewsletter } from "@repo/ui/api/subscribe";

export default function Footer():ReactElement {
  const LdInitialState = {
    message: "",
  };
  //Nextjs variable can't done coding standard
  const [state, formAction, pending] = useActionState(subscribeNewsletter, LdInitialState);
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
            <p className="text-primary/70 mb-6">
              Empowering businesses to overcome their toughest challenges and unlock growth through innovative AI-driven
              enterprise solutions.
            </p>
            <div className="flex space-x-4">
              <Link href="https://twitter.com/lmnaslimited" className="text-primary/70 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://in.linkedin.com/company/lmnaslimited" className="text-primary/70 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="https://www.youtube.com/@lmnascloudsolutions.4549" className="text-primary/70 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Solutions</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products/lens-erp-suite" className="text-primary/70 hover:text-primary transition-colors">
                  ERP Suite
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary/70 hover:text-primary transition-colors">
                 CPQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary/70 hover:text-primary transition-colors">
                  CRM 
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary/70 hover:text-primary transition-colors">
                  Analytics Cloud
                </Link>
              </li>
              <li>
                <Link href="/products/hrms-cloud" className="text-primary/70 hover:text-primary transition-colors">
                  HRMS Cloud
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary/70 hover:text-primary transition-colors">
                  AI-Powered Tools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-primary/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="text-primary/70 hover:text-primary transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-primary/70 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-primary/70 hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary/70 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary/70 mr-2 mt-0.5" />
                <span className="text-primary/70">123 Enterprise Way, Business District, CA 94105</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary/70 mr-2" />
                <Link href="tel:+1234567890" className="text-primary/70 hover:text-primary transition-colors">
                  (123) 456-7890
                </Link>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary/70 mr-2" />
                <Link
                  href="mailto:info@lmnas.com"
                  className="text-primary/70 hover:text-primary transition-colors"
                >
                  info@lmnas.com
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Subscribe to our newsletter</h4>
              <form action={formAction} className="flex gap-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  required
                  className="max-w-xs"
                />
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
              {state?.message && (
                <p className="text-sm mt-2 text-primary">{state.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 pb-16 sm:pb-0">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-primary/70 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} LMNAs. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#privacy" className="text-sm text-primary/70 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-sm text-primary/70 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#cookies" className="text-sm text-primary/70 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}