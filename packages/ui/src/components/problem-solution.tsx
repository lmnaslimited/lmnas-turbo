"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./problem-solution.module.css";
import { Button } from "@repo/ui/components/ui/button";
import { getIconComponent } from "@repo/ui/lib/icon";

import type {
  Tbutton,
  TformMode,
  TproblemSolutionSection,
} from "@repo/middleware/types";

type TproblemSolutionProps = {
  iData: TproblemSolutionSection;
  onFormButtonClick: (mode: TformMode, label: string) => void;
};

export default function ProblemSolution({
  iData,
  onFormButtonClick,
}: TproblemSolutionProps) {
  const [lActiveProblemIndex, setActiveProblemIndex] = useState(0);
  const [lExpandedSubProblem, setExpandedSubProblem] = useState<number | null>(
    null
  );

  const LaMainProblems = iData?.mainProblems ?? [];

  const fnRenderIcon = (iIcon: Tbutton["icon"]) => {
    const LIconName = typeof iIcon === "string" ? iIcon : "HelpCircle";
    const IconComponent = getIconComponent(LIconName);

    return <IconComponent className="h-5 w-5" />;
  };

  if (!LaMainProblems.length) return null;

  const LdActiveMainProblem = LaMainProblems[lActiveProblemIndex];

  return (
    <section className={styles.section}>
      <div className="container mx-auto px-4">

        {/* Main Problems */}
        <div className={styles.LMainProblems}>
          {LaMainProblems.map((iProblem, iIndex) => (
            <button
              key={iIndex}
              type="button"
              onClick={() => {
                setActiveProblemIndex(iIndex);
                setExpandedSubProblem(null);
              }}
              className={`rounded-full border px-5 py-3 text-sm font-medium transition-colors md:text-base ${
                lActiveProblemIndex === iIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary"
              }`}
            >
              {iProblem.title}
            </button>
          ))}
        </div>

        {/* Sub Problems */}
        <div className={styles.subProblems}>
          {LdActiveMainProblem?.subProblems?.map((iSubProblem, iIndex) => {
            const lIsExpanded = lExpandedSubProblem === iIndex;

            return (
              <div
                key={iIndex}
                className={`${styles.accordionItem} ${
                  lIsExpanded ? styles.accordionItemActive : ""
                }`}
              >
                {/* Problem Header */}
                <button
                  type="button"
                  aria-expanded={lIsExpanded}
                  aria-controls={`solution-${lActiveProblemIndex}-${iIndex}`}
                  onClick={() =>
                    setExpandedSubProblem(lIsExpanded ? null : iIndex)
                  }
                  className={styles.accordionTrigger}
                >
                  <div className={styles.problemInfo}>
                    <h3 className={styles.problemTitle}>
                      {iSubProblem.title}
                    </h3>

                    <p className={styles.problemDescription}>
                      {iSubProblem.description}
                    </p>
                  </div>

                  <span
                    className={`${styles.expandIcon} ${
                      lIsExpanded ? styles.expandIconActive : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                {/* Solution Panel */}
                <div
                  id={`solution-${lActiveProblemIndex}-${iIndex}`}
                  className={`${styles.solutionPanel} ${
                    lIsExpanded ? styles.solutionPanelOpen : ""
                  }`}
                  aria-hidden={!lIsExpanded}
                >
                  <div className={styles.solutionInner}>
                    <div className={styles.solutionContent}>
                      <h4 className={styles.solutionTitle}>
                        {iSubProblem.solutionTitle}
                      </h4>

                      <p className={styles.solutionDescription}>
                        {iSubProblem.solutionDescription}
                      </p>

                      <div className={styles.solutionAction}>
                        {iSubProblem.button.href ? (
                          <Button
                            asChild
                            size="lg"
                            className="gap-3"
                            variant={iSubProblem.button.variant ?? "default"}
                          >
                            <Link href={iSubProblem.button.href}>
                              {iSubProblem.button.label}
                              {fnRenderIcon(iSubProblem.button.icon)}
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            className="gap-3"
                            variant={iSubProblem.button.variant ?? "default"}
                            onClick={() => {
                              if (iSubProblem.button.formMode) {
                                onFormButtonClick(
                                  iSubProblem.button.formMode,
                                  iSubProblem.button.label ?? "Learn More"
                                );
                              }
                            }}
                          >
                            {iSubProblem.button.label}
                            {fnRenderIcon(iSubProblem.button.icon)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}