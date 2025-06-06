"use client"
import Link from "next/link"
import { type ReactElement, useActionState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Twitter, Linkedin, Mail, Phone, MapPin, Youtube } from "lucide-react"
import { subscribeNewsletter } from "@repo/ui/api/subscribe"
import { TfooterTarget } from "@repo/middleware";

// Map of icon names to their components
const iconMap = {
  Twitter: Twitter,
  Linkedin: Linkedin,
  Youtube: Youtube,
  Mail: Mail,
  Phone: Phone,
  MapPin: MapPin,
} as const

type IconKey = keyof typeof iconMap

export default function Footer({ idFooter }: { idFooter: TfooterTarget }): ReactElement {
  const LdInitialState = { message: "", }
  const [state, formAction, pending] = useActionState(subscribeNewsletter, LdInitialState)
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
              {idFooter.footer.social.map((item) => {
                const IconComponent = iconMap[item.icon as IconKey]
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className="text-primary/70 hover:text-primary transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{idFooter.footer.menu[0]?.label}</h3>
            <ul className="space-y-3">
              {idFooter.footer.product.map((item) => (
                <li key={item.label}>
                  <Link href={item.href!} className="text-primary/70 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{idFooter.footer.menu[1]?.label}</h3>
            <ul className="space-y-3">
              {idFooter.footer.more.map((item) => (
                <li key={item.label}>
                  <Link href={item.href!} className="text-primary/70 hover:text-primary transition-colors">
                    {item.label}
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
              <form action={formAction} className="flex gap-2">
                <Input
                  type="email"
                  name="email"
                  placeholder={idFooter.footer.menu[4]?.label}
                  required
                  className="max-w-xs"
                />
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? idFooter.footer.menu[4]?.description : idFooter.footer.menu[4]?.icon}
                </Button>
              </form>
              {state?.message && <p className="text-sm mt-2 text-primary">{state.message}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 pb-16 sm:pb-0">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-primary/70 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {idFooter.footer.companyName}. {idFooter.footer.menu[5]?.label}
            </p>
            <div className="flex space-x-6">
              {idFooter.footer.policies.map((item) => (
                <Link
                  key={item.label}
                  href={`${item.href!}`}
                  className="text-sm text-primary/70 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}