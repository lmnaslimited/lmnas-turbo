import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function SocialProof() {
  return (
    <div className="bg-white" id="case-studies">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by Leading Businesses Across Industries
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <img
                className="max-h-12"
                src={`/placeholder.svg?height=48&width=120&text=Logo ${i}`}
                alt={`Client ${i}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 lg:text-center">
          <p className="text-base text-gray-500">
            Our clients have experienced remarkable transformations. Here are some key metrics:
          </p>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { name: "Efficiency Increase", stat: "40%" },
              { name: "Cost Reduction", stat: "25%" },
              { name: "Revenue Growth", stat: "30%" },
            ].map((item) => (
              <div key={item.name} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{item.stat}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="#contact">Read Our Case Studies</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

