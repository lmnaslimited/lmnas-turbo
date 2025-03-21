"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Badge } from "@repo/ui/components/ui/badge"
import { Lightbulb, CheckCircle2, TrendingUp } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"


type TcaseStudy ={
  company: string
  solution: {
    description: string
    products: string[]
    details: string[]
  }
  results: {
    metric: string
    value: string
  }[]
  testimonial?: {
    author: string
    title: string
    quote: string
  }
}

export function SolutionSection({ idCaseStudy }: {idCaseStudy:TcaseStudy}) {
  const SectionRef = useRef<HTMLDivElement>(null)
 
  const LdItemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <section ref={SectionRef} className="mb-24">
      <div
       
      >
        {/* Solution Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-8">
          <motion.div variants={LdItemVariants} className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              The Breakthrough Moment: How We Transformed {idCaseStudy.company}
            </h2>
          </motion.div>

          <motion.p variants={LdItemVariants} className="mb-8 text-lg text-muted-foreground">
            {idCaseStudy.solution.description}
          </motion.p>

          <motion.div variants={LdItemVariants} className="mb-8 flex flex-wrap gap-2">
            {idCaseStudy.solution.products.map((iProduct: string, index: number) => (
              <Badge key={index}  className="text-base">
                {iProduct}
              </Badge>
            ))}
          </motion.div>

          <motion.div variants={LdItemVariants} className="grid gap-6 md:grid-cols-2">
            {idCaseStudy.solution.details.map((iDetail: string, index: number) => (
              <div
                key={index}
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
            <h2 className="text-2xl font-bold md:text-3xl">The Results</h2>
          </motion.div>

          <motion.div variants={LdItemVariants} className="grid gap-6 sm:grid-cols-2">
            {idCaseStudy.results.map((idResult: {metric:string, value:string}, index: number) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Background decoration */}
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />

                <h3 className="mb-2 text-lg font-semibold">{idResult.metric}</h3>
                <p className="text-3xl font-bold text-primary">{idResult.value}</p>
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
                    <span className="text-sm text-muted-foreground">Verified Client</span>
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
                  <Button variant="outline" size="icon" className="rounded-full">
                    <span className="sr-only">Share on LinkedIn</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-linkedin"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <span className="sr-only">Share on Twitter</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-twitter"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <span className="sr-only">Share via Email</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-mail"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </Button>
                </div>
              </div>
              <Button className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-download"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Download Case Study PDF
              </Button>
            </div>
      </div>
    </section>
  )
}

