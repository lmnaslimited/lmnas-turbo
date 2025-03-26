"use client";

import { ReactElement, useRef } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Download, CheckCircle2, ArrowRight } from "lucide-react";

type TSidebarCardType = {
  title: string;
  content: string;
  button?: {
    label: string;
    link?: string;
    icon?: string;
  };
  solutions?: string[];
  solutionsDescription?: string[];
  link?: {
    label: string;
    href: string;
  };
};

type Tsolution = {
  solution: { products: string[] } 
}

export function DynamicSidebar({ idCaseStudy }: { idCaseStudy: Tsolution }):ReactElement {
  const SidebarRef = useRef<HTMLDivElement>(null);

  const sidebarData: TSidebarCardType[] = [
    {
      title: "Ready to Transform Your Business?",
      content: "Let's discuss how LMNAs can help you achieve similar results for your organization.",
      button: {
        label: "Book a Free Consultation",
        link: "https://nectar.lmnas.com/book_appointment"
      }
    },
    {
      title: "Solutions Used",
      content: "A list of solutions used in this case study.",
      solutions: idCaseStudy.solution.products,
      solutionsDescription: [
        "Core solution for business operations",
        "Enhanced analytics and insights"
      ],
      link: {
        label: "Learn more about our solutions",
        href: "/solutions"
      }
    },
    {
      title: "Get the Full Story",
      content: "Download the complete case study with detailed analysis and implementation steps.",
      button: {
        label: "Download Case Study",
        icon: "Download"
      }
    }
  ];

  return (
    <div ref={SidebarRef} className="relative">
      <div className="sticky" style={{ position: "sticky", top: "2rem" }}>
        {sidebarData.map((idCard, iIndex) => (
          <Card key={iIndex} className="mb-6 overflow-hidden transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">{idCard.title}</h3>
              <p className="mb-6 text-muted-foreground">{idCard.content}</p>

              {/* Solutions List */}
              {idCard.solutions && (
                <ul className="space-y-4">
                  {idCard.solutions.map((iSolution, iIndex) => (
                    <li key={iIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <span className="font-medium">{iSolution}</span>
                        <p className="text-sm text-muted-foreground">
                          {idCard.solutionsDescription?.[iIndex] || ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Button if exists */}
              {idCard.button && (
                <Button className="w-full gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  {idCard.button.link ? (
                    <Link href={idCard.button.link}>{idCard.button.label}</Link>
                  ) : (
                    idCard.button.label
                  )}
                </Button>
              )}

              {/* Link if exists */}
              {idCard.link && (
                <div className="mt-6">
                  <Link href={idCard.link.href} className="flex items-center gap-2 text-primary hover:underline">
                    {idCard.link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
