"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState, ReactElement } from "react";
import TitleSubtitle from "@repo/ui/components/titleSubtitle";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronRight, Download } from "lucide-react";
import { TcalloutProps, TformMode } from "@repo/middleware";

export function ProblemSection({ idCaseStudy,onButtonClick }: { idCaseStudy: TcalloutProps, onButtonClick?: (mode: TformMode) => void }): ReactElement {
  const SectionRef = useRef<HTMLDivElement>(null);

  // Checks if the section is in view for triggering animations
  const IsInView = useInView(SectionRef, { once: false, amount: 0.3 });

  // Manages the active challenge being displayed
  const [ActiveChallenge, fnSetActiveChallenge] = useState(0);

  // Auto-rotates through the list of challenges every 3 seconds when in view
  useEffect(() => {
    if (!IsInView) return;

    const Interval = setInterval(() => {
      fnSetActiveChallenge(
        (prev) => (prev + 1) % idCaseStudy.list.length
      );
    }, 3000);

    return () => clearInterval(Interval);
  }, [idCaseStudy.list.length, IsInView]);

  // Animation variants for smooth fade-in effect
  const ItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section ref={SectionRef} className="mb-24">
      <div>
        <motion.div variants={ItemVariants} className="mb-8">
          {/* Download button for small screens */}
          <div className="mb-6 lg:hidden">
            {idCaseStudy.buttons.map((idButton, index) => (
              <Button
                key={index}
                className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary"
                onClick={() => {
                  if (onButtonClick && idButton.formMode) {
                    onButtonClick(idButton.formMode)
                  }
                }}
              >
                <Download className="h-4 w-4" />
                {idButton.label}
              </Button>
            ))}
          </div>
          <TitleSubtitle
            idTitle={{
              ...idCaseStudy.header,
              className: "m-0",
              headingClass: "md:text-3xl sm:text-2xl",
              descripClass: "md:text-lg",
            }}
          />
        </motion.div>

        {/* List of challenges with interactive selection */}
        <motion.div variants={ItemVariants} className="mb-12 space-y-6">
          {/* challenges */}
          {idCaseStudy.list.map((iChallenge, iIndex) => (
            <div
              key={iIndex}
              className={`cursor-pointer rounded-lg border p-6 transition-all duration-300 ${iIndex === ActiveChallenge
                ? "border-primary bg-primary/5 shadow-md"
                : "border-muted bg-card hover:border-muted/80 hover:bg-muted/5"
                }`}
              onClick={() => fnSetActiveChallenge(iIndex)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iIndex === ActiveChallenge
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  <span className="font-mono text-sm font-bold">
                    {iIndex + 1}
                  </span>
                </div>
                <div>
                  <p
                    className={`text-lg ${iIndex === ActiveChallenge ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {iChallenge.label}
                  </p>
                  {/* Additional details for the active challenge */}
                  {iIndex === ActiveChallenge && (
                    // footer.title
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-sm text-muted-foreground"
                    >
                      {idCaseStudy.header.badge}
                      <ChevronRight className="ml-1 inline h-3 w-3" />
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={ItemVariants} className="rounded-lg p-6">
          <TitleSubtitle
            // fotter header
            idTitle={{
              highlight: idCaseStudy.title,
              subtitle: idCaseStudy.subtitle,
              className: "m-0",
              headingClass: "md:text-lg sm:text-lg",
              descripClass: "md:text-base",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
