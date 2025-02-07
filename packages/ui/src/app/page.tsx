import Link from "next/link"
import { Button } from "@repo/packages/ui"
import { ArrowRight, Cloud, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to LMNAs Cloud Solutions</h1>
        <p className="text-xl mb-8">Empowering your business with cutting-edge cloud technology</p>
        <Button asChild>
          <Link href="/contact">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <Cloud className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Cloud Infrastructure</h2>
          <p>Scalable and reliable cloud infrastructure to support your growing business needs.</p>
        </div>
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Security Solutions</h2>
          <p>Advanced security measures to protect your data and ensure compliance.</p>
        </div>
        <div className="text-center">
          <Zap className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Performance Optimization</h2>
          <p>Boost your application performance with our optimization techniques.</p>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your business?</h2>
        <p className="text-xl mb-8">Let's discuss how LMNAs Cloud Solutions can help you achieve your goals.</p>
        <Button asChild>
          <Link href="/contact">
            Contact Us <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}

