import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Zap } from "lucide-react";
import { TheroProps, TformMode } from "../type.js";
import { ReactElement } from "react";
import { motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import TitleSubtitle from "@repo/ui/components/titleSubtitle";

interface HeroProps {
  idHero: TheroProps;
  onButtonClick?: (mode: TformMode) => void;
}

export default function Hero({ idHero, onButtonClick }: HeroProps): ReactElement {
  /**
   * Handles button clicks by triggering the provided callback function
   * with the selected form mode, if available.
   */
  const fnHandleButtonClick = (iFormMode?: TformMode) => {
    if (onButtonClick && iFormMode) {
      onButtonClick(iFormMode);
    }
  };

   /**
   * Renders a badge with an icon and text.
   * Typically used for highlighting a special feature or status.
   */
  const Badge = ({ text }: { text: string }): ReactElement => (
    <div className="inline-flex w-fit items-center rounded-full border border-primary/60 bg-slate px-3 py-1 text-sm text-primary/70">
      <Zap className="mr-1 h-3.5 w-3.5" />
      <span>{text}</span>
    </div>
  );

   /**
   * Displays a list of features, each represented by an icon and text.
   * This section helps in showcasing key benefits or highlights of the hero section.
   */
  const FeatureList = ({ items }: { items?: TheroProps["items"] }): ReactElement => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items?.map((idItem, iIndex) => (
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
  const CTAButtons = ({ buttons }: { buttons: TheroProps["buttons"] }): ReactElement => (
    <div className="flex flex-col gap-4 sm:flex-row">
      {buttons.map((idButton, index) =>
        idButton.href ? (
          <Link href={idButton.href} key={index}>
            <Button
              size={idButton.size || "lg"}
              variant={idButton.variant || "default"}
              className={idButton.className}
            >
              {idButton.iconPosition === "before" && idButton.icon}
              {idButton.label}
              {idButton.iconPosition === "after" && idButton.icon}
            </Button>
          </Link>
        ) : (
          <Button
            key={index}
            size={idButton.size || "lg"}
            variant={idButton.variant || "default"}
            className={idButton.className}
            onClick={() => fnHandleButtonClick(idButton.formMode)}
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
    <div className={cn("container grid gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 items-center md:py-24 lg:py-32 py-20")}>
      <div className={cn("flex flex-col justify-center space-y-8")}>
        {idHero.heading.badge && <Badge text={idHero.heading.badge} />}
        <TitleSubtitle idTitle={{
          ...idHero.heading,
          className: "m-0",
          headingClass: "md:text-6xl lg:text-7xl tracking-tight",
          descripClass: "max-w-xl md:text-2xl"
        }} />
        {idHero.items && <FeatureList items={idHero.items} />}
        <CTAButtons buttons={idHero.buttons} />
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
    <section className={cn("relative overflow-hidden border-b border-border/40 md:py-24 lg:py-32 py-20")}>
      <div className={cn("container relative z-10 mx-auto px-4 md:px-6")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
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
          <CTAButtons buttons={idHero.buttons} />
        </motion.div>
      </div>
    </section>
  );
}