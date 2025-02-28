import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import ThemeSwitcher from "@repo/ui/components/ThemeSwitcher"

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <Link href="/">
              <span className="sr-only">LMNAs</span>
              <img className="h-10 w-auto" src="/placeholder.svg?height=40&width=120" alt="LMNAs Logo" />
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link
                href="#solutions"
                className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Solutions
              </Link>
              <Link
                href="#why-lmnas"
                className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Why LMNAs
              </Link>
              <Link
                href="#case-studies"
                className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Case Studies
              </Link>
            </div>
          </div>
          <div className="ml-10 space-x-4 flex items-center">
            <ThemeSwitcher />
            <Button asChild variant="outline">
              <Link href="#contact">Contact Us</Link>
            </Button>
            <Button asChild>
              <Link href="https://nectar.lmnas.com/book_appointment">Book a Demo</Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}

