import { CheckCircle } from "lucide-react"

const steps = [
  { name: "Discovery Session", description: "Understand your pain points and goals." },
  { name: "Customized Roadmap", description: "Tailored solutions designed for your business." },
  { name: "Implementation", description: "Seamless integration of LMNAs tools into your workflows." },
  { name: "Continuous Support", description: "Ongoing training, optimization, and enhancements." },
]

export default function CustomerJourney() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Customer Journey</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            What to Expect When You Work with LMNAs
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our proven process ensures a smooth transition and maximizes the value of your investment.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {steps.map((step) => (
              <div key={step.name} className="relative">
                <dt>
                  <CheckCircle className="absolute h-6 w-6 text-green-500" aria-hidden="true" />
                  <p className="ml-9 text-lg leading-6 font-medium text-gray-900">{step.name}</p>
                </dt>
                <dd className="mt-2 ml-9 text-base text-gray-500">{step.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

