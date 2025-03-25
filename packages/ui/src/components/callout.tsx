"use client"

import Link from "next/link"
import { TcalloutProps } from "@repo/ui/type";
import { Button } from "@repo/ui/components/ui/button"
import type { FormMode } from "@repo/ui/components/form"
import type { ReactElement } from "react"
import { cn } from "@repo/ui/lib/utils";

export default function Callout({
  idCallout,
  Layout = "classic",
  onButtonClick,
}: {
  idCallout?: TcalloutProps
  Layout?: "classic" | "simple"
  onButtonClick?: (mode: FormMode) => void
}): ReactElement | null {
  if (!idCallout) return null;

  return (
    <div
      className={`${Layout === "classic" ? "max-w-3xl" : "max-w-7xl"} mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8`}
    >
      {/* Header content remains the same */}
      {Layout === "classic" ? (
        <h2 className={cn("text-3xl font-extrabold sm:text-4xl", idCallout.variant || "text-secondary")}>
          <span className="block">{idCallout.header.textWithoutColor}</span>
          <span className="block">{idCallout.header.subtitle}</span>
        </h2>
      ) : (
        <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          <span className="block">{idCallout?.header?.textWithoutColor || ""}</span>
          <span className="block text-primary/70">{idCallout?.header?.subtitle || ""}</span>
        </h2>
      )}

      {/* Points content remains the same */}
      <p className="mt-4 text-lg leading-6 text-secondary">
        {idCallout.points?.title}
      </p>
      <ul className="mt-4 space-y-4">
        {idCallout.points?.items?.map((point, index) => (
          <li key={index} className={cn("text-lg", idCallout.variant || "text-secondary")}>
            {point}
          </li>
        ))}
      </ul>
      <p className={cn("mt-8 text-xl", idCallout.variant || "text-secondary")}>
        {idCallout.points?.actionText}
      </p>

      {/* Fixed button rendering */}
      <div className="mt-8 flex justify-center space-x-3">
        {idCallout.buttons.map((idButton, index) => {
          const buttonContent = (
            <>
              {idButton.icon && idButton.iconPosition === "before" && (
                <span className="mr-2">{idButton.icon}</span>
              )}
              {idButton.label}
              {idButton.icon && idButton.iconPosition === "after" && (
                <span className="ml-2">{idButton.icon}</span>
              )}
            </>
          );

          return idButton.href ? (
            <Link href={idButton.href} key={`btn-${index}`} passHref legacyBehavior>
              <Button
                variant={idButton.variant || "default"}
                size={idButton.size || "default"}
              >
                {buttonContent}
              </Button>
            </Link>
          ) : (
            <Button
              key={`btn-${index}`}
              variant={idButton.variant || "default"}
              size={idButton.size || "default"}
              onClick={() => {
                if (onButtonClick && idButton.formMode) {
                  onButtonClick(idButton.formMode)
                }
              }}
            >
              {buttonContent}
            </Button>
          );
        })}
      </div>
    </div>
  )
}