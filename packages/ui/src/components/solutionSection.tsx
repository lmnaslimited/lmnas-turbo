"use client"

import { ReactElement, useRef } from "react"
import { motion } from "framer-motion"
import { Badge } from "@repo/ui/components/ui/badge"
import { Lightbulb, CheckCircle2, TrendingUp, Download, LucideIcon } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { TsolutionSection} from "@repo/ui/type"
import * as Icons from "lucide-react";


export function SolutionSection({ idCaseStudy }: {idCaseStudy:TsolutionSection}):ReactElement {
  const SectionRef = useRef<HTMLDivElement>(null)
 
  // Animation variants for fade-in effect.
  const LdItemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <section ref={SectionRef} className="mb-24">
        {/* Solution Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-8">
          <motion.div variants={LdItemVariants} className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-14 items-center justify-center rounded-full bg-primary/20">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              {idCaseStudy.header.textWithoutColor}
              </h2>
          </motion.div>
          <motion.p variants={LdItemVariants} className="mb-8 text-lg text-muted-foreground">
            {idCaseStudy.header.subtitle}
          </motion.p>
          <motion.div variants={LdItemVariants} className="mb-8 flex flex-wrap gap-2">
            {idCaseStudy.products.map((iProduct, iIndex) => (
              <Badge key={iIndex}  className="text-base">
                {iProduct}
              </Badge>
            ))}
          </motion.div>

          <motion.div variants={LdItemVariants} className="grid gap-6 md:grid-cols-2">
            {idCaseStudy.details.map((iDetail, iIndex) => (
              <div
                key={iIndex}
                className="flex items-start gap-3 rounded-lg border border-primary/10 bg-primary/5 p-6 transition-all hover:border-primary/20 hover:shadow-lg"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <p>{iDetail}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Results Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 p-8">
          <motion.div variants={LdItemVariants} className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-foreground/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">{idCaseStudy.title}</h2>
          </motion.div>

          <motion.div variants={LdItemVariants} className="grid gap-6 sm:grid-cols-2">
            {idCaseStudy.results.map((idResult, iIndex) => (
              <div
                key={iIndex}
                className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Background decoration */}
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                <h3 className="mb-2 text-lg font-semibold">{idResult.textWithoutColor}</h3>
                <p className="text-3xl font-bold text-primary">{idResult.subtitle}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Testimonial Section */}
        {idCaseStudy.testimonial && (
          <motion.div
            variants={LdItemVariants}
            className="relative mt-16 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 p-8"
          >
            <div className="relative z-10 flex flex-col items-center md:flex-row md:items-start md:gap-8">
              {/* Avatar */}
              <div className="mb-6 flex flex-col items-center md:mb-0">
                <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-background shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
                    {idCaseStudy.testimonial.author.charAt(0)}
                  </div>
                </div>
                <div className="text-center md:w-32">
                  <p className="font-semibold">{idCaseStudy.testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{idCaseStudy.testimonial.title}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="relative">
                <svg
                  className="absolute -left-2 -top-2 h-8 w-8 text-primary/30"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <blockquote className="pl-8 pt-4">
                  <p className="mb-4 text-xl font-medium leading-relaxed md:text-2xl">
                    "{idCaseStudy.testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((iStar) => (
                        <svg key={iStar} className="h-5 w-5 fill-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{idCaseStudy.testimonial.verify}</span>
                  </div>
                </blockquote>
              </div>
            </div>
          </motion.div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-6">
              <div>
                <h3 className="text-lg font-semibold">Share this case study</h3>
                <div className="mt-2 flex gap-2">
                {idCaseStudy.footer.handles.map((idItem, iIndex) => {
                const IconComponent = (Icons[idItem.icon as keyof typeof Icons] as LucideIcon) || Icons.Users;
                return (
                  <Button variant="outline" size="icon" className="rounded-full" key={iIndex}>
                    <span className="sr-only">{idItem.label}</span>
                    <IconComponent className="w-5 h-5" />
                  </Button>
                );
              })}
                </div>
              </div>
              <Button className="flex items-center gap-2">
                <Download className="w-5 h-5" />
               {idCaseStudy.footer.button.label}
              </Button>
            </div>
    </section>
  )
}

