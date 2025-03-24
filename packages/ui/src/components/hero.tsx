"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Zap } from "lucide-react";
import { TheroProps } from "../type.js";
import { ReactElement } from "react";

export default function Hero({ idHero }: { idHero: TheroProps }):ReactElement {
  return (
    <div className="container grid gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 items-center md:py-24 lg:py-32 py-20">
      <div className="flex flex-col justify-center space-y-8">
        {/* Badge */}
        {idHero.heading.badge && (
          <div className="inline-flex w-fit items-center rounded-full border border-primary/60 bg-slate px-3 py-1 text-sm text-primary/70">
            <Zap className="mr-1 h-3.5 w-3.5" />
            <span>{idHero.heading.badge}</span>
          </div>
        )}

        {/* Headline */}
        <div className="space-y-4">
          <h1
            className={`text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl ${idHero.heading.headingClass}`}
          >
            {idHero.heading.textWithoutColor}{" "}
            <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
              {idHero.heading.text}
            </span>
          </h1>
          {idHero.heading.subtitle && (
            <p
              className={`max-w-xl text-xl text-primary/70 md:text-2xl ${idHero.heading.descripClass}`}
            >
              {idHero.heading.subtitle}
            </p>
          )}
        </div>

        {/* Feature highlights */}
        {idHero.items && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {idHero.items.map((idItem, iIndex) => (
              <div
                className="flex items-center gap-2 text-primary/80"
                key={iIndex}
              >
                {idItem.icon}
                <span>{idItem.item}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {idHero.buttons.map(
            (idButton, index) =>
              idButton.href && (
                <Link href={idButton.href} key={index}>
                  <Button
                    key={index}
                    size={idButton.size || "lg"}
                    variant={idButton.variant || "default"}
                    className={idButton.className}
                  >
                    {idButton.iconPosition === "before" && idButton.icon}
                    {idButton.label}
                    {idButton.iconPosition === "after" && idButton.icon}
                  </Button>
                </Link>
              )
          )}
        </div>
      </div>

      {/* Image part */}
      {idHero.image?.src && (
        <div className="flex items-center justify-center">
          <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-lg p-1">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={idHero.image?.src || "/placeholder.svg"}
                alt={idHero.image.alt}
                className="h-full w-full object-cover"
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
