import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function Closing() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Ready to Make Manufacturing Predictable and Profitable?
        </h2>
        <p className="mt-4 text-xl text-gray-500">
          Take the first step towards transforming your manufacturing operations.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="https://nectar.lmnas.com/book_appointment">Schedule Your Free Consultation Now</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

