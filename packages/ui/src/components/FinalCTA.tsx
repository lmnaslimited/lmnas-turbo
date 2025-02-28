import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function FinalCTA() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">Ready to Eliminate Your Enterprise Challenges?</span>
          <span className="block text-indigo-600">
            Let's work together to build a future where your business operates at its best—every single day.
          </span>
        </h2>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Button asChild size="lg">
              <Link href="https://nectar.lmnas.com/book_appointment">Book Your Free Consultation</Link>
            </Button>
          </div>
          <div className="ml-3 inline-flex">
            <Button asChild size="lg" variant="outline">
              <Link href="#contact">Contact Us Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

