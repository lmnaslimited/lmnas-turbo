import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

const painPoints = [
  "Your Sales Manager struggles with manual pricing and lost leads.",
  "Your Procurement team misses deadlines due to poor coordination.",
  "Your Operations Manager is tired of firefighting inefficiencies.",
  "Your Finance Manager can't trust the numbers during quarterly reviews.",
]

export default function PainPointStorytelling() {
  return (
    <div className="bg-indigo-700">
      <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Does This Sound Like Your Business?</span>
          <span className="block">If so, you're in the right place.</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-indigo-200">We understand the challenges you face:</p>
        <ul className="mt-4 space-y-4">
          {painPoints.map((point, index) => (
            <li key={index} className="text-lg text-white">
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xl text-white">We get it. And we're here to fix it—for good.</p>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Button asChild size="lg" variant="secondary">
              <Link href="#solutions">Start Solving Your Problems Today</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

