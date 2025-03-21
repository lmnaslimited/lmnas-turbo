"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Download, CheckCircle2, ArrowRight } from "lucide-react";

type SidebarCardType = {
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


export function DynamicSidebar({ idCaseStudy }: { idCaseStudy: { solution: { products: string[] } } }) {
  const SidebarRef = useRef<HTMLDivElement>(null);

  const sidebarData: SidebarCardType[] = [
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
        {sidebarData.map((card, index) => (
          <Card key={index} className="mb-6 overflow-hidden transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">{card.title}</h3>
              <p className="mb-6 text-muted-foreground">{card.content}</p>

              {/* Solutions List */}
              {card.solutions && (
                <ul className="space-y-4">
                  {card.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <span className="font-medium">{solution}</span>
                        <p className="text-sm text-muted-foreground">
                          {card.solutionsDescription?.[i] || ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Button if exists */}
              {card.button && (
                <Button className="w-full gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  {card.button.link ? (
                    <Link href={card.button.link}>{card.button.label}</Link>
                  ) : (
                    card.button.label
                  )}
                </Button>
              )}

              {/* Link if exists */}
              {card.link && (
                <div className="mt-6">
                  <Link href={card.link.href} className="flex items-center gap-2 text-primary hover:underline">
                    {card.link.label}
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
