"use client";

import Link from "next/link";
import { type ReactElement } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import { getIconComponent } from "@repo/ui/lib/icon";
import { TcalloutProps, TformMode, Tbutton } from "@repo/middleware/type";

const renderIcon = (icon: Tbutton["icon"]) => {
  const IconComponent = getIconComponent(
    typeof icon === "string" ? icon : "HelpCircle"
  );
  return <IconComponent className="w-5 h-5" />;
};

type CalloutProps = {
  idCallout: TcalloutProps;

  fnHandleFormButtonClick?: (
    mode: TformMode,
    sectionId: string,
    label?: string
  ) => void;

  // FormSection injects this
  sectionId?: string;

  // (Optional legacy handler - not used)
  onButtonClick?: (mode: TformMode, formTitle?: string) => void;
};

export default function Callout({
  idCallout,
  fnHandleFormButtonClick,
  sectionId,
}: CalloutProps): ReactElement {
  const Layout = idCallout.layout || "classic";

  const CalloutHeader = () => (
    <h2
      className={
        Layout === "classic"
          ? cn("text-3xl font-extrabold sm:text-4xl", idCallout.variant)
          : "text-3xl font-extrabold tracking-tight sm:text-4xl"
      }
    >
      <span
        className={
          Layout === "classic"
            ? "block text-background"
            : "block text-foreground"
        }
      >
        {idCallout.header.title}
      </span>
      <span
        className={
          Layout === "classic"
            ? "block text-background"
            : "block text-foreground"
        }
      >
        {idCallout.header.subtitle}
      </span>
    </h2>
  );

  return (
    <div
      className={
        Layout === "classic"
          ? "max-w-3xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8"
          : "max-w-7xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8"
      }
    >
      {/* Header */}
      <CalloutHeader />

      {/* Title */}
      <p className="mt-4 text-lg leading-6 text-secondary">{idCallout.title}</p>

      {/* Bullet points */}
      <ul className="mt-4 space-y-4">
        {idCallout.list?.map((item, index) => (
          <li
            key={index}
            className={cn("text-lg", idCallout.variant || "text-secondary")}
          >
            {item.label}
          </li>
        ))}
      </ul>

      {/* Subtitle */}
      <p className={cn("mt-8 text-xl", idCallout.variant || "text-secondary")}>
        {idCallout.subtitle}
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
        {idCallout.buttons.map((btn, index) => {
          const content = (
            <>
              {btn.label}
              <span className="ml-2">{renderIcon(btn.icon)}</span>
            </>
          );

          // If button has an href → render link
          if (btn.href) {
            return (
              <Link href={btn.href} key={index}>
                <Button
                  variant={btn.variant || "default"}
                  size={btn.size || "lg"}
                >
                  {content}
                </Button>
              </Link>
            );
          }

          // Otherwise → trigger form
          return (
            <Button
              key={index}
              variant={btn.variant || "default"}
              size={btn.size || "lg"}
              onClick={() =>
                fnHandleFormButtonClick?.(btn.formMode!, sectionId!, btn.label)
              }
            >
              {content}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
