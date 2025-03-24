import { Button } from "@repo/ui/components/ui/button";
import clsx from "clsx";
import Link from "next/link";
import { Tbutton, TcalloutProps } from "@repo/ui/type";
import { ReactElement } from "react";

export default function Callout({idCallout}:{idCallout: TcalloutProps}):ReactElement {
  const Layout = idCallout.layout || "classic";
  return (
    <div
      className={`${Layout === "classic" ? "max-w-3xl" : "max-w-7xl"} mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8`}
    >
      {Layout === "classic" ? (
        <h2
          className={clsx(
            "text-3xl font-extrabold sm:text-4xl",
            idCallout.variant || "text-secondary"
          )}
        >
          <span className="block">{idCallout.header.textWithoutColor}</span>
          <span className="block">{idCallout.header.subtitle}</span>
        </h2>
      ) : (
        <h2 className="text-3xl font-extrabold tracking-tight text-border sm:text-4xl">
          <span className="block">{idCallout.header.textWithoutColor}</span>
          <span className="block text-primary/70">
            {idCallout.header.subtitle}
          </span>
        </h2>
      )}

      <p className="mt-4 text-lg leading-6 text-secondary">
        {idCallout.points?.title}
      </p>
      <ul className="mt-4 space-y-4">
        {idCallout.points?.items?.map((point: string, index: number) => (
          <li
            key={index}
            className={clsx("text-lg", idCallout.variant || "text-secondary")}
          >
            {point}
          </li>
        ))}
      </ul>
      <p
        className={clsx("mt-8 text-xl", idCallout.variant || "text-secondary")}
      >
        {idCallout.points?.actionText}
      </p>
      <div className="mt-8 flex justify-center space-x-3">
        {idCallout.buttons.map((button: Tbutton, index: number) => (
          <Button
            key={`btn-${index}`}
            variant={button.variant || "default"}
            size={button.size || "default"}
          >
            {/* If iconPosition is 'before', render icon first */}
            {button.icon && button.iconPosition === "before" && (
              <span className="mr-2">{button.icon}</span>
            )}

            {/* Button Label */}
            {button.href && <Link href={button.href}>{button.label}</Link>}
            {/* If iconPosition is 'after', render icon after */}
            {button.icon && button.iconPosition === "after" && (
              <span className="ml-2">{button.icon}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}