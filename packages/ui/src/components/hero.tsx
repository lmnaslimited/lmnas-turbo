"use client"

import { DynamicWeb } from "@repo/ui/components/animation/dynamicWeb"
import { MotionWrapper } from "@repo/ui/components/animation/motionWrapper"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { Tbutton, Theader } from "../type.js"

type TheroProps = {
  heading: Theader;
  buttons: Tbutton[]
}
export default function Hero({iHero}:{iHero:TheroProps}) {
  return (
    <section className="relative flex items-center justify-center min-h-screen px-6 sm:px-12 lg:px-20">
      <DynamicWeb />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background"></div>

      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <MotionWrapper>
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
              {iHero.heading.textWithoutColor}{" "}
              <span className="text-primary/70">{iHero.heading.text}</span>
            </h1>
            <p className="mt-4 text-xl text-primary/70">
              {iHero.heading.subtitle}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4 w-full justify-between">
             {iHero.buttons.map((btn, index) => (
                <Button key={`btn-${index}`} variant={btn.variant || "default"} size={btn.size || "default"} className="group font-semibold">
                  {/* If iconPosition is 'before', render icon first */}
                  {btn.icon && btn.iconPosition === "before" && <span className="mr-2">{btn.icon}</span>}

                  {/* Button Label */}
                  {btn.href &&<Link href={btn.href}>{btn.label}</Link>}

                  {/* If iconPosition is 'after', render icon after */}
                  {btn.icon && btn.iconPosition === "after" && <span className="ml-2">{btn.icon}</span>}
                </Button>
              ))}
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