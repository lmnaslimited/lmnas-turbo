"use client";
import Link from "next/link";
import { ReactElement, useRef } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Download, CheckCircle2, ArrowRight } from "lucide-react";
import { TSidebarCardType } from "@repo/ui/type";

export function DynamicSidebar({ idCaseStudy }: { idCaseStudy: TSidebarCardType[] }): ReactElement {
  // Reference to the sidebar container for potential future use (e.g., scrolling)
  const SidebarRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={SidebarRef} className="relative">

      {/* Sticky container to keep the sidebar fixed while scrolling */}
      <div className="sticky" style={{ position: "sticky", top: "2rem" }}>
        {idCaseStudy.map((idCard, iIndex) => (
          <Card key={iIndex} className="mb-6 overflow-hidden transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">{idCard.title}</h3>
              <p className="mb-6 text-muted-foreground">{idCard.content}</p>

              {/* Render solutions list if available */}
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

              {/* Render a button if provided */}
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

              {/* Render a link if available */}
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
