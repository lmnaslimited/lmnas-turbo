import { Database, Users, BarChart3, UserCircle, Bot } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

const solutions = [
  {
    name: "LENS ERP Suite",
    description: "The heart of your enterprise operations—integrated, efficient, and built to grow with you.",
    icon: Database,
  },
  {
    name: "CRM & CPQ",
    description: "Drive revenue with better customer management and streamlined pricing.",
    icon: Users,
  },
  {
    name: "Analytics Cloud",
    description: "Actionable insights, whenever and wherever you need them.",
    icon: BarChart3,
  },
  {
    name: "HRMS Cloud",
    description: "Empower your workforce with seamless employee management.",
    icon: UserCircle,
  },
  {
    name: "AI-Powered Tools",
    description: "From chatbots to predictive analytics, we deliver cutting-edge technology to your business.",
    icon: Bot,
  },
]

export default function SolutionsOverview() {
  return (
    <div className="bg-gray-50 py-12" id="solutions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Solutions</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Powerful Solutions Tailored to Your Needs
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            From ERP to AI-powered analytics, we offer a comprehensive suite of solutions to drive your business
            forward.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {solutions.map((solution) => (
              <div key={solution.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <solution.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{solution.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{solution.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link href="#contact">Explore Our Solutions</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

