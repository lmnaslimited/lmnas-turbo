import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { TcalloutProps } from "@repo/ui/type";
import { ReactElement } from "react";
import { cn } from "@repo/ui/lib/utils";

export default function Callout({
  idCallout,
}: {
  idCallout: TcalloutProps;
}): ReactElement {
  const Layout = idCallout.layout || "classic";
  return (
    <div
      className={`${Layout === "classic" ? "max-w-3xl" : "max-w-7xl"} mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8`}
    >
      {Layout === "classic" ? (
        <h2
          className={cn(
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
        {idCallout.points?.items?.map((point, index) => (
          <li
            key={index}
            className={cn("text-lg", idCallout.variant || "text-secondary")}
          >
            {point}
          </li>
        ))}
      </ul>
      <p className={cn("mt-8 text-xl", idCallout.variant || "text-secondary")}>
        {idCallout.points?.actionText}
      </p>
      <div className="mt-8 flex justify-center space-x-3">
        {idCallout.buttons.map((idButton, index) => (
          <Button
            key={`btn-${index}`}
            variant={idButton.variant || "default"}
            size={idButton.size || "default"}
          >
            {/* If iconPosition is 'before', render icon first */}
            {idButton.icon && idButton.iconPosition === "before" && (
              <span className="mr-2">{idButton.icon}</span>
            )}

            {/* Button Label */}
            {idButton.href && (
              <Link href={idButton.href}>{idButton.label}</Link>
            )}
            {/* If iconPosition is 'after', render icon after */}
            {idButton.icon && idButton.iconPosition === "after" && (
              <span className="ml-2">{idButton.icon}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
