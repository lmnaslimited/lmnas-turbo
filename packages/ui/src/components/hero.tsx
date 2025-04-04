import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Zap } from "lucide-react";
import { TheroProps, TformMode } from "../type.js";
import { ReactElement } from "react";
import { cn } from "@repo/ui/lib/utils";
import TitleSubtitle from "@repo/ui/components/titleSubtitle";

type THeroProps = {
  idHero: TheroProps;
  onButtonClick?: (mode: TformMode) => void;
}

export default function Hero({ idHero, onButtonClick }: THeroProps): ReactElement {
  /**
  * Renders a badge with an icon and text.
  * Typically used for highlighting a special feature or status.
  */
  const Badge = ({ iText }: { iText: string }): ReactElement => (
    <div className="inline-flex w-fit items-center rounded-full border border-primary/60 bg-slate px-3 py-1 text-sm text-primary/70">
      <Zap className="mr-1 h-3.5 w-3.5" />
      <span>{iText}</span>
    </div>
  );

  /**
  * Displays a list of features, each represented by an icon and text.
  * This section helps in showcasing key benefits or highlights of the hero section.
  */
  const FeatureList = ({ iaItems }: { iaItems?: TheroProps["items"] }): ReactElement => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {iaItems?.map((idItem, iIndex) => (
        <div className={cn("flex items-center gap-2 text-primary/80")} key={iIndex}>
          {idItem?.icon}
          <span>{idItem?.item}</span>
        </div>
      ))}
    </div>
  );

  /**
  * Renders a list of call-to-action (CTA) buttons.
  * Supports both internal navigation (via Link) and functional actions.
  */
  const CTAButtons = ({ iaButtons }: { iaButtons: TheroProps["buttons"] }): ReactElement => (
    <div className="flex flex-col gap-4 sm:flex-row">
      {iaButtons.map((idButton, iIndex) =>
        idButton.href ? (
          <Link href={idButton.href} key={iIndex}>
            <Button
              size={idButton.size || "lg"}
              variant={idButton.variant || "default"}
              className={cn("w-full sm:w-auto sm:flex-1", idButton.className)}
            >
              {idButton.iconPosition === "before" && idButton.icon}
              {idButton.label}
              {idButton.iconPosition === "after" && idButton.icon}
            </Button>
          </Link>
        ) : (
          <Button
            key={iIndex}
            size={idButton.size || "lg"}
            variant={idButton.variant || "default"}
            className={idButton.className}
            onClick={() => onButtonClick?.(idButton.formMode)}
          >
            {idButton.iconPosition === "before" && idButton.icon}
            {idButton.label}
            {idButton.iconPosition === "after" && idButton.icon}
          </Button>
        )
      )}
    </div>
  );

  return idHero.image?.src ? (
    /**
    * Hero section variant with an image.
    * Displays content alongside a visual representation for better engagement.
    */
    <div className={cn("container grid gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 items-center py-16 md:py-24 lg:py-32")}>
      <div className={cn("flex flex-col justify-center space-y-8")}>
        {idHero.heading.badge && <Badge iText={idHero.heading.badge} />}
        <TitleSubtitle idTitle={{
          ...idHero.heading,
          className: "m-0",
          headingClass: "md:text-6xl lg:text-7xl tracking-tight",
          descripClass: "max-w-xl md:text-2xl"
        }} />
        {idHero.items && <FeatureList iaItems={idHero.items} />}
        <CTAButtons iaButtons={idHero.buttons} />
      </div>
      {/* Image part */}
      <div className={cn("flex items-center justify-center")}>
        <div className={cn("relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-lg p-1")}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={idHero.image?.src || "/placeholder.svg"}
              alt={idHero?.image?.alt || ""}
              className={cn("h-full w-full object-cover")}
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    /**
    * Hero section variant without an image.
    * This version focuses entirely on the textual content and call-to-action elements.
    */
    <section className={cn("relative overflow-hidden py-16 md:py-24 lg:py-32")}>
      <div className={cn("container relative z-10 mx-auto px-4 md:px-6")}>
        <div
          className={cn("mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center")}
        >
          <TitleSubtitle idTitle={{
            ...idHero.heading,
            className: "mx-auto flex max-w-[58rem] flex-col items-center justify-center mb-4 text-center m-0",
            headingClass: "sm:text-4xl md:text-5xl lg:text-6xl",
            descripClass: "max-w-[85%] md:text-xl/relaxed mx-auto"
          }} />
          <p className={cn("max-w-[85%] text-muted-foreground md:text-xl/relaxed mx-auto mb-2")}>
            {idHero.description}
          </p>
          <CTAButtons iaButtons={idHero.buttons} />
        </div>
      </div>
    </section>
  );
}