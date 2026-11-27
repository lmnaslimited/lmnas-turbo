import Image from "next/image";
import Link from "next/link";
import { Zap, ChevronDown, Check } from "lucide-react";
import { ReactElement } from "react";
import { cn } from "@repo/ui/lib/utils";
import { getIconComponent } from "@repo/ui/lib/icon";
import { Button } from "@repo/ui/components/ui/button";
import TitleSubtitle from "@repo/ui/components/title-subtitle";
import { TformMode, Titems, Tbutton, TheroSection } from "@repo/middleware/types";

type THeroProps = {
  idHero: TheroSection;
  currentSector?: string;
  onButtonClick?: (mode: TformMode, formTitle?: string) => void;
};

const renderIcon = (icon: Tbutton["icon"]) => {
  const iconName = typeof icon === "string" ? icon : "HelpCircle";
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className="w-5 h-5" />;
};

export default function Hero({
  idHero,
  currentSector,
  onButtonClick,
}: THeroProps): ReactElement {
  /**
   * Renders a badge with an icon and text.
   */
  const Badge = ({ iText }: { iText: string }): ReactElement => (
    <div className="inline-flex w-fit items-center rounded-full border bg-accent px-3 py-1 text-sm text-primary/70">
      <Zap className="mr-1 h-3.5 w-3.5" />
      <span>{iText}</span>
    </div>
  );

  console.log("idHero sector label", idHero.sectorLabel);

  /**
   * Displays a list of features.
   */
  const FeatureList = ({ iaItems }: { iaItems?: Titems[] }): ReactElement => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {iaItems?.map((idItem, iIndex) => (
        <div
          className={cn("flex items-center gap-2 text-primary/80")}
          key={iIndex}
        >
          {renderIcon(idItem?.icon)}
          <span>{idItem?.label}</span>
        </div>
      ))}
    </div>
  );

  /**
   * Renders CTA buttons.
   * Existing button behavior is preserved.
   */
  const CTAButtons = ({
    iaButtons,
  }: {
    iaButtons: Tbutton[];
  }): ReactElement => (
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
            onClick={
              !idButton.href
                ? () => onButtonClick?.(idButton.formMode, idButton.label)
                : undefined
            }
          >
            {idButton.href ? (
              <Link href={idButton.href}>{buttonContent}</Link>
            ) : (
              <span>{buttonContent}</span>
            )}
          </Button>
        );
      })}
    </div>
  );

  /**
   * Renders sector navigation option
   */
  const SectorDropdown = (): ReactElement | null => {
    const laSectors = idHero.sectorDropdown ?? [];

    const selectedSector = laSectors.find(
      (idSector) => idSector.sector === currentSector,
    );

    if (!selectedSector) return null;

    return (
      <div className="flex flex-col gap-2">
        {/* Label outside details */}
        {idHero.sectorLabel && (
          <span className="text-md font-semibold text-gray-900 pb-2">
            {idHero.sectorLabel}
          </span>
        )}

        <details className="group relative w-fit">
          <summary
            className="
            flex cursor-pointer list-none items-center justify-between gap-3
            rounded-lg border border-gray-200 bg-white
            px-6 py-3 text-sm font-semibold text-gray-900
            shadow-sm transition-all duration-200
            hover:border-gray-400 hover:shadow-md
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-black focus-visible:ring-offset-2
          "
          >
            {selectedSector.label}

            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
          </summary>

          <div
            className="
            absolute left-0 top-full z-50 mt-2 min-w-[200px]
            overflow-hidden rounded-xl border border-gray-200
            bg-white p-1.5 shadow-xl
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          >
            {laSectors.map((idSector, iIndex) => {
              const isSelected = idSector.sector === currentSector;

              return (
                <Link
                  key={iIndex}
                  href={idSector.href}
                  aria-current={isSelected ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors duration-150",
                    isSelected
                      ? "bg-gray-100 font-semibold text-black"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black",
                  )}
                >
                  {idSector.label}

                  {isSelected && <Check className="h-4 w-4 text-black" />}
                </Link>
              );
            })}
          </div>
        </details>
      </div>
    );
  };
  return idHero.image?.source ? (
    /**
     * Hero layout with image.
     */
    <div
      className={cn(
        "container grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-8 lg:py-24 xl:gap-16",
      )}
    >
      <div className={cn("flex flex-col justify-center space-y-8")}>
        {idHero.heading.badge && <Badge iText={idHero.heading.badge} />}

        <TitleSubtitle
          idTitle={{
            ...idHero.heading,
            className: "m-0",
            headingClass: "md:text-5xl lg:text-6xl tracking-tight",
            descripClass: "max-w-xl md:text-xl",
          }}
        />

        {idHero.highlight && <FeatureList iaItems={idHero.highlight} />}

        <CTAButtons iaButtons={idHero.buttons} />
        <SectorDropdown />
      </div>

      <div className="w-full overflow-hidden rounded-xl">
        <Image
          src={idHero.image.source}
          alt={idHero.image.alternate}
          className="aspect-[4/3] h-auto w-full object-cover"
          height={1000}
          width={1000}
        />
      </div>
    </div>
  ) : (
    /**
     * Hero layout without image.
     */
    <section className={cn("relative overflow-hidden py-16 md:py-24 lg:py-32")}>
      <div className={cn("container relative z-10 mx-auto px-4 md:px-6")}>
        <div
          className={cn(
            "mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center",
          )}
        >
          <TitleSubtitle
            idTitle={{
              ...idHero.heading,
              className:
                "mx-auto flex max-w-[58rem] flex-col items-center justify-center mb-4 text-center m-0",
              headingClass: "sm:text-4xl md:text-5xl lg:text-6xl",
              descripClass: "max-w-[85%] md:text-xl/relaxed mx-auto",
            }}
          />

          <p
            className={cn(
              "mx-auto mb-2 max-w-[85%] text-muted-foreground md:text-xl/relaxed",
            )}
          >
            {idHero.description}
          </p>

          <CTAButtons iaButtons={idHero.buttons} />
          <SectorDropdown />
        </div>
      </div>
    </section>
  );
}