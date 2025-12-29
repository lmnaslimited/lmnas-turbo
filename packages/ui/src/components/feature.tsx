import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { cva } from "class-variance-authority"
import { ReactElement } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { getIconComponent } from "@repo/ui/lib/icon";
import { TfeatureProps, Titems, Tbutton } from "@repo/middleware/types"

const renderIcon = (icon: Tbutton['icon']) => {
  const iconName = typeof icon === "string" ? icon : "HelpCircle";
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className="w-5 h-5" />;
};
/**
 * Utility function to define the button container styles based on position.
 * Uses `cva` (Class Variance Authority) to generate responsive styles dynamically.
 */

const fnButtonContainer = cva("mt-8 flex lg:flex-shrink-0", {
  variants: {
    position: {
      header: "lg:mt-0",
      "bottom-left": "justify-start mt-12",
      "bottom-center": "justify-center mt-12",
      "bottom-right": "justify-end mt-12",
    },
  },
  defaultVariants: {
    position: "header",
  },
})

export default function Feature({ idFeature }: { idFeature: TfeatureProps }): ReactElement {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Check if the feature layout should be "centered". If true, display centered content. */}
      {idFeature.layout === "centered" ? (
        <div className="lg:text-center">
          <h2 className="text-base text-primary/70 font-semibold tracking-wide uppercase">{idFeature.heading?.badge}</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-primary sm:text-4xl">
            {idFeature.heading?.title}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto">
            {idFeature.heading?.subtitle}
          </p>
        </div>

      ) : (
        // Alternative layout where the header and button are aligned horizontally
        <div className="mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            <span className="block">{idFeature.heading.title}</span>
            <span className="block text-primary/70">{idFeature.heading.highlight}</span>
          </h2>

          {/* Conditionally render a button in the header if `iShowButton` is true and button position is `header` */}
          {idFeature.iShowButton && idFeature.buttonPosition === "header" && (
            <div className={fnButtonContainer({ position: "header" })}>
              {/* <Button asChild size="lg">
                {idFeature.buttons[0]?.href && (
                  <Link href={idFeature.buttons[0]?.href}>{idFeature.buttons[0]?.label}</Link>)}
              </Button> */}
              {idFeature.buttons?.[0]?.href && (
                <Link href={idFeature.buttons[0].href}>
                  <Button size="lg">

                    {idFeature.buttons[0].label} {" "}
                    {renderIcon(idFeature.buttons[0].icon)}

                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section to display feature items (FAQ-like list) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {idFeature.highlight?.map((idItem) => (
              <FAQItem key={idItem.label} {...idItem} />
            ))}
          </div>
        </div>

        {/* Conditionally render a button at the bottom if `iShowButton` is true and button position is not `header` */}
        {idFeature.iShowButton && idFeature.buttonPosition !== "header" && (
          <div className={fnButtonContainer({ position: idFeature.buttonPosition })}>
            {/* <Button asChild size="lg">
              {idFeature.buttons[0]?.href && (
                <Link href={idFeature.buttons[0]?.href}>{idFeature.buttons[0]?.label}</Link>)}
            </Button> */}
            {idFeature.buttons?.[0]?.href && (
              <Link href={idFeature.buttons[0].href}>
                <Button size="lg">

                  {idFeature.buttons[0].label}{" "}
                  {renderIcon(idFeature.buttons[0].icon)}
                </Button>

              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const FAQItem = (idItems: Titems): ReactElement => {
  // Dynamically retrieve the icon component from `lucide-react` based on the icon name provided
  const IconComponent = idItems.icon && (LucideIcons[idItems.icon as keyof typeof LucideIcons] as React.ElementType)
  return (
    <div className="relative flex gap-4 items-start">
      {IconComponent && (
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-muted text-background shrink-0">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
      )}
      <div className={IconComponent ? "ml-2" : ""}>
        <div className="text-lg leading-6 font-medium text-primary">{idItems.label}</div>
        <div className="mt-2 text-base text-muted-foreground">{idItems.description}</div>
      </div>
    </div>

  )
}