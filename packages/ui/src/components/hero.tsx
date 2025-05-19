import * as Icons from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
import { ReactElement } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import TitleSubtitle from "@repo/ui/components/titleSubtitle";
import { getIconComponent } from "@repo/ui/lib/icon";
import { TformMode, Titems, Tbutton, TheroSection } from "@repo/middleware";

type THeroProps = {
  idHero: TheroSection;
  onButtonClick?: (mode: TformMode, formTitle?:string) => void;
}

const renderIcon = (icon: Tbutton['icon']) => {
  const iconName = typeof icon === "string" ? icon : "HelpCircle";
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className="w-5 h-5" />;
};

export default function Hero({ idHero, onButtonClick }: THeroProps): ReactElement {
  /**
  * Renders a badge with an icon and text.
  * Typically used for highlighting a special feature or status.
  */
  const Badge = ({ iText }: { iText: string }): ReactElement => (
    <div className="inline-flex w-fit items-center rounded-full border bg-accent px-3 py-1 text-sm text-primary/70">
      <Zap className="mr-1 h-3.5 w-3.5" />
      <span>{iText}</span>
    </div>
  );

  /**
  * Displays a list of features, each represented by an icon and text.
  * This section helps in showcasing key benefits or highlights of the hero section.
  */

  const FeatureList = ({ iaItems }: { iaItems?: Titems[] }): ReactElement => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {iaItems?.map((idItem, iIndex) => {
        return (
          <div className={cn("flex items-center gap-2 text-primary/80")} key={iIndex}>
            {renderIcon(idItem?.icon)}
            <span>{idItem?.label}</span>
          </div>
        );
      })}
    </div>
  );

  /**
  * Renders a list of call-to-action (CTA) buttons.
  * Supports both internal navigation (via Link) and functional actions.
  */
  const CTAButtons = ({ iaButtons }: { iaButtons: Tbutton[] }): ReactElement => (
    <div className="flex flex-col gap-4 sm:flex-row">
      {iaButtons.map((idButton, iIndex) => {
        const iconElement = (
          <span className="h-4 w-4 transition-transform group-hover:translate-x-1">
            {renderIcon(idButton.icon)}
          </span>
        );
        const buttonContent = (
          <span className="flex items-center justify-center gap-2">
            {idButton.iconPosition === "before" && iconElement}
            <span>{idButton.label}</span>
            {idButton.iconPosition === "after" && iconElement}
          </span>
        );
        return (
          <Button
            key={iIndex}
            size={idButton.size || "lg"}
            variant={idButton.variant || "default"}
            className={cn("sm:w-auto sm:flex-1", idButton.className)}
            asChild={!!idButton.href}
            onClick={!idButton.href ? () => onButtonClick?.(idButton.formMode, idButton.label) : undefined}
          >
            {idButton.href ? <Link href={idButton.href}>{buttonContent}</Link> : <span>{buttonContent}</span>}
          </Button>
        );
      })}
    </div>
  );

  return idHero.image?.source ? (
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
        {idHero.highlight && <FeatureList iaItems={idHero.highlight} />}
        <CTAButtons iaButtons={idHero.buttons} />
      </div>
      {/* Image part */}
      <div className={cn("flex items-center justify-center")}>
  <div
    className={cn(
      // Increased max width, taller aspect ratio, removed padding
      "relative w-full max-w-[700px] aspect-[3/2] overflow-hidden rounded-lg min-w-[300px] md:mt-16"
    )}
  >
    <Image
      src={idHero.image?.source || "/placeholder.svg"}
      alt={idHero?.image?.alternate || ""}
      fill
      className="object-contain"
    />
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