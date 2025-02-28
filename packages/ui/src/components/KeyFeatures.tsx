import { BarChart3, Cog, LineChart, Users, Calendar, LayoutDashboard } from "lucide-react"

const features = [
  {
    name: "Real-Time Dashboards",
    description: "Gain live insights into production, inventory, and sales pipelines.",
    icon: LayoutDashboard,
  },
  {
    name: "End-to-End Integration",
    description: "Unify Sales, Procurement, Production, and Finance in one system.",
    icon: Cog,
  },
  {
    name: "Automated Workflows",
    description: "Streamline processes and reduce manual intervention.",
    icon: LineChart,
  },
  {
    name: "Predictive Analytics",
    description: "Make proactive decisions with actionable data insights.",
    icon: BarChart3,
  },
  {
    name: "Seamless Scheduling",
    description: "Ensure smooth coordination between departments.",
    icon: Calendar,
  },
  {
    name: "Role-Specific Views",
    description: "Provide tailored dashboards for shop floor managers, sales teams, and leadership.",
    icon: Users,
  },
]

export default function KeyFeatures() {
  return (
    <section className="py-12 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Key Features of LMNAs ERP for Manufacturing
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Discover how LMNAs ERP can transform your manufacturing operations with these powerful features.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

