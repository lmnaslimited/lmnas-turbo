"use client";
import Link from "next/link";
import { ReactElement, useRef } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Download, CheckCircle2 } from "lucide-react";
import { TcardProps, TformMode } from "@repo/middleware";

export function DynamicSidebar({ idCaseStudy, onButtonClick, }: { idCaseStudy: TcardProps[], onButtonClick?: (mode: TformMode) => void }): ReactElement {
  // Reference to the sidebar container for potential future use (e.g., scrolling)
  const SidebarRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={SidebarRef} className="relative">

      {/* Sticky container to keep the sidebar fixed while scrolling */}
      <div className="sticky" style={{ position: "sticky", top: "2rem" }}>
        {idCaseStudy.map((idCard, iIndex) => (
          <Card key={iIndex} className="mb-6 overflow-hidden transition-all duration-300">
            <CardContent className="p-6">
              {idCard.header && (
                <>
                  <h3 className="mb-4 text-xl font-semibold">{idCard.header.title}</h3>
                  <p className="mb-6 text-muted-foreground">{idCard.header.subtitle}</p>
                </>
              )}

              {/* Render solutions list if available */}
              {idCard.list && (
                <ul className="space-y-4">
                  {idCard.list.map((iSolution, iIndex) => (
                    <li key={iIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <span className="font-medium">{iSolution.label}</span>
                        <p className="text-sm text-muted-foreground">
                          {iSolution.description || ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Render a button if provided */}
              {idCard.buttons && idCard.buttons.map((idButton, index) => {
                 // Construct button content, including an optional icon
                         
                return idButton.href ? (
                  <Link href={idButton.href} key={`btn-${index}`}>
                    <Button
                    >
                      {idButton.label}
                    </Button>
                  </Link>
                ) : (
      
                  // Render a standard button with an event handler if no href is provided
                  <Button
                    key={`btn-${index}`}
                    onClick={() => {
                      if (onButtonClick && idButton.formMode) {
                        onButtonClick(idButton.formMode)
                      }
                    }}
                  >
                    {idButton.label}
                  </Button>
                );
              })}

              {/* Render a link if available
              {idCard.link && (
                <div className="mt-6">
                  <Link href={idCard.link.href} className="flex items-center gap-2 text-primary hover:underline">
                    {idCard.link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
