"use client"

import { DynamicWeb } from "@repo/ui/components/animation/dynamicWeb"
import { MotionWrapper } from "@repo/ui/components/animation/motionWrapper"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center min-h-screen px-6 sm:px-12 lg:px-20">
      <DynamicWeb />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background"></div>

      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <MotionWrapper>
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
              Reimagine Your Business.{" "}
              <span className="text-primary/70">Achieve the Extraordinary.</span>
            </h1>
            <p className="mt-4 text-lg text-primary/50">
              From seamless operations to actionable insights, LMNAs empowers businesses to overcome their toughest
              challenges and unlock growth—no matter the industry.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
              <Button asChild size="lg">
                <Link href="https://nectar.lmnas.com/book_appointment">
                  Book Your Free Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#solutions">Explore Our Solutions</Link>
              </Button>
            </div>
          </div>
        </MotionWrapper>

        {/* Right Image with Motion */}
        <MotionWrapper>
          <div className="w-full flex justify-center lg:justify-end">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
              <rect width="100%" height="100%" fill="#ddd" />
              <text
                x="400"
                y="300"
                textAnchor="middle"
                fill="#555"
                fontSize="48"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
              >
                Image
              </text>
            </svg>
          </div>
        </MotionWrapper>
        
      </div>
    </section>
  )
}