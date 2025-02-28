import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function Introduction() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">Why Choose LMNAs?</span>
          <span className="block text-indigo-600">We solve problems that matter.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Button asChild size="lg">
              <Link href="#solutions">See How We Can Help You</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {[
              {
                question: "Is inefficiency slowing you down?",
                answer: "Our solutions streamline your processes, boosting productivity across your organization.",
              },
              {
                question: "Are disjointed systems holding your teams back?",
                answer: "We integrate your systems, ensuring seamless communication and collaboration.",
              },
              {
                question: "Do you need real-time insights to make smarter decisions?",
                answer:
                  "Our analytics tools provide actionable insights, empowering you to make data-driven decisions.",
              },
              {
                question: "Looking for a trusted partner in your digital transformation?",
                answer: "With decades of experience, we're committed to your success every step of the way.",
              },
            ].map((item) => (
              <div key={item.question} className="relative">
                <dt>
                  <p className="text-lg leading-6 font-medium text-gray-900">{item.question}</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

