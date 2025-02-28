import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function Callout() {
  return (
    <div className="bg-indigo-700">
      <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Your Transformation Starts Here.</span>
          <span className="block">The first step to solving your enterprise problems is just a conversation away.</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Button asChild size="lg" variant="secondary">
              <Link href="https://nectar.lmnas.com/book_appointment">Book a Free Consultation Now</Link>
            </Button>
          </div>
          <div className="ml-3 inline-flex">
            <Button asChild size="lg" variant="outline">
              <Link href="#contact">Talk to an Expert</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

