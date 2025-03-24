"use client"

import { ReactElement, useState } from "react"
import Link from "next/link"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { ArrowRight } from "lucide-react"

type TcaseStudy = {
  id: string | number;
  slug: string;
  company: string;
  industry: string;
  results: { metric: string; value: string }[];
}[];

export function RelatedCaseStudies({ idCaseStudies }: {idCaseStudies:TcaseStudy}):ReactElement {
  const [ActiveIndustry, fnSetActiveIndustry] = useState("all")

  // Get unique industries
  const LaIndustries = ["all", ...new Set(idCaseStudies.map((study) => study.industry.toLowerCase()))]

  // Filter case studies by industry
  const LaFilteredCaseStudies =
  ActiveIndustry === "all"
      ? idCaseStudies
      : idCaseStudies.filter((study) => study.industry.toLowerCase() === ActiveIndustry)

  return (
    <section className="border-t bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <h2 className="text-3xl font-bold">Explore More Case Studies</h2>

          <Tabs value={ActiveIndustry} onValueChange={fnSetActiveIndustry}>
            <TabsList>
              {LaIndustries.map((iIndustry) => (
                <TabsTrigger key={iIndustry} value={iIndustry} className="capitalize">
                  {iIndustry === "all" ? "All Industries" : iIndustry}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LaFilteredCaseStudies.map((idStudy) => (
            <Link
              key={idStudy.id}
              href={`/solutions/${idStudy.slug}`}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Decorative background gradient */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

              <Badge className="mb-2">{idStudy.industry}</Badge>
              <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">{idStudy.company}</h3>
              <p className="mb-4 text-muted-foreground">
                {idStudy.results[0]?.metric}: <span className="font-bold text-primary">{idStudy.results[0]?.value}</span>
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                Read case study
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="px-8">
            View All Case Studies
          </Button>
        </div>
      </div>
    </section>
  )
}

