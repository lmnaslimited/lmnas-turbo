"use client"

import Image from "next/image";
import { MotionWrapper } from "@repo/ui/components/animation/motionWrapper"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { Zap, Clock, BarChart3, ArrowRight } from "lucide-react";
import { TheroProps } from "../type.js"


export default function Hero({ iHero }: { iHero: TheroProps }) {
  return (
    <div className="container grid gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 items-center md:py-24 lg:py-32 py-20">
      <div className="flex flex-col justify-center space-y-8">
        {/* Badge */}
        {iHero.heading.badge && (
          <div className="inline-flex w-fit items-center rounded-full border border-zinc-300 bg-zinc-200/50 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
            <Zap className="mr-1 h-3.5 w-3.5" />
            <span>{iHero.heading.badge}</span>
          </div>
        )}

        {/* Headline */}
        <div className="space-y-4">
          <h1 className={`text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl ${iHero.heading.headingClass}`}>
            {iHero.heading.textWithoutColor} {" "}
            <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent dark:from-zinc-300 dark:to-zinc-500">
              {iHero.heading.text}
            </span>
          </h1>
          {iHero.heading.subtitle && (
            <p className={`max-w-xl text-xl text-primary/70 md:text-2xl ${iHero.heading.descripClass}`}>
              {iHero.heading.subtitle}
            </p>
          )}
        </div>

        {/* Feature highlights */}
        {iHero.items && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {iHero.items.map((idItem, iIndex) => (
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300" key={iIndex}>
                {idItem.icon}
                <span>{idItem.item}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {iHero.buttons.map((button, index) => (
            <Button key={index} size={button.size || "lg"} variant={button.variant || "default"} className={button.className}>
              {button.iconPosition === "before" && button.icon}
              {button.label}
              {button.iconPosition === "after" && button.icon}
            </Button>
          ))}
        </div>
      </div>

      {/* Visual */}
      <div className="flex items-center justify-center">
        <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-lg bg-gradient-to-br from-zinc-300/50 to-zinc-100/50 p-1 dark:from-zinc-700/50 dark:to-zinc-900/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/placeholder.svg"
              alt="AI-powered manufacturing dashboard visualization"
              className="h-full w-full object-cover opacity-90 grayscale"
              width={100}
              height={100}
              
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-100/80 to-transparent dark:from-zinc-900/80"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
