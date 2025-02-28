import { Zap, Users, BarChart, Lock } from "lucide-react"

const features = [
  {
    name: "Lightning Fast",
    description: "Our platform is optimized for speed, ensuring your team can work efficiently without any lag.",
    icon: Zap,
  },
  {
    name: "Team Collaboration",
    description: "Seamlessly work together with your team members, share resources, and communicate in real-time.",
    icon: Users,
  },
  {
    name: "Advanced Analytics",
    description: "Gain valuable insights into your projects and team performance with our powerful analytics tools.",
    icon: BarChart,
  },
  {
    name: "Enterprise-grade Security",
    description: "Rest easy knowing your data is protected by state-of-the-art security measures and encryption.",
    icon: Lock,
  },
]

export default function Features() {
  return (
    <div className="py-12 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to work together
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            StreamLine offers a comprehensive set of tools to help your team collaborate effectively and deliver
            outstanding results.
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
    </div>
  )
}

