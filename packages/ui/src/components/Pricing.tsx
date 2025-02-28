import { Check } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: 29,
    features: ["Up to 5 team members", "Basic analytics", "5GB storage", "Email support"],
  },
  {
    name: "Pro",
    price: 79,
    features: ["Up to 20 team members", "Advanced analytics", "50GB storage", "Priority email support", "API access"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited team members",
      "Custom analytics",
      "Unlimited storage",
      "24/7 phone support",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
]

export default function Pricing() {
  return (
    <div className="bg-gray-100 py-12" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-gray-500">Choose the plan that best fits your team's needs</p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">All the basics for getting started.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  {typeof plan.price === "number" && <span className="text-base font-medium text-gray-500">/mo</span>}
                </p>
                <Button className="mt-8 w-full">Get started</Button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

