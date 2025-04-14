import { Button } from "@repo/ui/components/ui/button";
import clsx from "clsx";
import Link from "next/link";
import { Tbutton, Tcallout } from "@repo/ui/type"
import { cn } from "@repo/ui/lib/utils";

export default function Callout({ idCallout, layout = "classic" }: { idCallout: Tcallout, layout?: "classic" | "simple" }) {
  return (
    <div className={`${layout === "classic" ? "max-w-3xl" : "max-w-7xl"} mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8`}>
      {layout === "classic" ? (<h2 className={clsx("text-3xl font-extrabold sm:text-4xl", idCallout.variant || "text-secondary")}>
        <span className="block">{idCallout.header.highlight}</span>
        <span className="block">{idCallout.header.subtitle}</span>
      </h2>) : (

        <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          <span className="block">{idCallout.header.highlight}</span>
          <span className="block text-primary/70">
            {idCallout.header.subtitle}
          </span>
        </h2>

      )}

      <p className="mt-4 text-lg leading-6 text-secondary">{idCallout.title}</p>
      <ul className="mt-4 space-y-4">
        {idCallout.list?.label?.map((label: string, index: number) => (
          <li key={index} className={clsx("text-lg", idCallout.variant || "text-secondary")}>
            {label}
          </li>
        ))}
      </ul>
      <p className={clsx("mt-8 text-xl", idCallout.variant || "text-secondary")}>{idCallout.subtitle}</p>
      <div className="mt-8 flex justify-center space-x-3">
        {idCallout.button.map((button: Tbutton, index: number) => (
          <Button
            key={`btn-${index}`}
            variant={button.variant || "default"}
            size={button.size || "default"}
          >
            {/* If iconPosition is 'before', render icon first */}
            {button.icon && button.iconPosition === "before" && <span className="mr-2">{button.icon}</span>}

            {/* Button Label */}
            {button.href && <Link href={button.href}>
              {button.label}
            </Link>}
            {/* If iconPosition is 'after', render icon after */}
            {button.icon && button.iconPosition === "after" && <span className="ml-2">{button.icon}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
}