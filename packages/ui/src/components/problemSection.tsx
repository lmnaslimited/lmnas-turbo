"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronRight, Download } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"

type TcaseStudy = {
  company: string;
  challenges: string[];
};

export function ProblemSection({ idCaseStudy }: {idCaseStudy:TcaseStudy}) {
  const SectionRef = useRef<HTMLDivElement>(null)
  const IsInView = useInView(SectionRef, { once: false, amount: 0.3 })
  const [ActiveChallenge, fnSetActiveChallenge] = useState(0)

  // Auto-rotate through challenges
  useEffect(() => {
    if (!IsInView) return

    const Interval = setInterval(() => {
      fnSetActiveChallenge((prev) => (prev + 1) % idCaseStudy.challenges.length)
    }, 3000)

    return () => clearInterval(Interval)
  }, [idCaseStudy.challenges.length, IsInView])

  const ItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section ref={SectionRef} className="mb-24">
      <div>
        <motion.div variants={ItemVariants} className="mb-8">
          {/* Download button for small screens */}
          <div className="mb-6 lg:hidden">
            <Button className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary">
              <Download className="h-4 w-4" />
              Download Case Study PDF
            </Button>
          </div>

          <h2 className="mt-4 text-2xl font-bold md:text-3xl">
            {" "}
            How {idCaseStudy.company} eliminated production bottlenecks with AI-powered predictive maintenance.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Before partnering with LMNAs, {idCaseStudy.company} faced several critical challenges that were impacting
            their business growth and operational efficiency.
          </p>
        </motion.div>

        <motion.div variants={ItemVariants} className="mb-12 space-y-6">
          {idCaseStudy.challenges.map((challenge: string, index: number) => (
            <div
              key={index}
              className={`cursor-pointer rounded-lg border p-6 transition-all duration-300 ${
                index === ActiveChallenge
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-muted bg-card hover:border-muted/80 hover:bg-muted/5"
              }`}
              onClick={() => fnSetActiveChallenge(index)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    index === ActiveChallenge ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="font-mono text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <p
                    className={`text-lg ${index === ActiveChallenge ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {challenge}
                  </p>
                  {index === ActiveChallenge && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-sm text-muted-foreground"
                    >
                      Click to learn how we solved this challenge <ChevronRight className="ml-1 inline h-3 w-3" />
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={ItemVariants} className="rounded-lg p-6">
          <h3 className="mb-2 text-lg font-medium text-primary">The Bottom Line</h3>
          <p className="text-primary">
            These challenges were costing {idCaseStudy.company} an estimated{" "}
            <span className="font-bold">$2.5M annually</span> in lost revenue and operational inefficiencies.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

