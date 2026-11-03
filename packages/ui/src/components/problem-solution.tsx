"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@repo/ui/components/ui/button";
import { getIconComponent } from "@repo/ui/lib/icon";

import type {
  Tbutton,
  TformMode,
  TproblemSolutionSection,
} from "@repo/middleware/types";

type ProblemSolutionProps = {
  data: TproblemSolutionSection;
  onFormButtonClick: (mode: TformMode, label: string) => void;
};

export default function ProblemSolution({
  data,
  onFormButtonClick,
}: ProblemSolutionProps) {
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);
  const [expandedSubProblem, setExpandedSubProblem] = useState<number | null>(
    null
  );

  const mainProblems = data?.mainProblems ?? [];

  const renderIcon = (icon: Tbutton["icon"]) => {
    const iconName = typeof icon === "string" ? icon : "HelpCircle";
    const IconComponent = getIconComponent(iconName);

    return <IconComponent className="w-5 h-5" />;
  };

  if (!mainProblems.length) return null;

  const activeMainProblem = mainProblems[activeProblemIndex];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">

        {/* Main Problems */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {mainProblems.map((problem, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setActiveProblemIndex(index);
                setExpandedSubProblem(null);
              }}
              className={`rounded-full border px-5 py-3 text-sm font-medium transition-colors md:text-base ${
                activeProblemIndex === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary"
              }`}
            >
              {problem.title}
            </button>
          ))}
        </div>

        {/* Sub Problems */}
        <div className="mx-auto max-w-4xl space-y-4">
          {activeMainProblem?.subProblems?.map((subProblem, index) => {
            const isExpanded = expandedSubProblem === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedSubProblem(isExpanded ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold">
                      {subProblem.title}
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {subProblem.description}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-2xl transition-transform ${
                      isExpanded ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                {/* Solution */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 p-5 md:p-6">
                    <h4 className="text-xl font-semibold">
                      {subProblem.solutionTitle}
                    </h4>

                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {subProblem.solutionDescription}
                    </p>

                    <div className="mt-5">
                      {subProblem.button.href ? (
                        <Button
                          asChild
                          size="lg"
                          className="gap-4"
                          variant={
                            subProblem.button.variant ?? "default"
                          }
                        >
                          <Link href={subProblem.button.href}>
                            {subProblem.button.label}
                            {renderIcon(subProblem.button.icon)}
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          className="gap-4"
                          variant={
                            subProblem.button.variant ?? "default"
                          }
                          onClick={() => {
                            if (subProblem.button.formMode) {
                              onFormButtonClick(
                                subProblem.button.formMode,
                                subProblem.button.label ?? "Learn More"
                              );
                            }
                          }}
                        >
                          {subProblem.button.label}
                          {renderIcon(subProblem.button.icon)}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}