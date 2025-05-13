import Link from "next/link"
import type { ReactElement } from "react"
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button"
import { TcalloutProps, TformMode, Tbutton } from "@repo/middleware";
import { getIconComponent } from "@repo/ui/lib/icon";

const renderIcon = (icon: Tbutton['icon']) => {
  const iconName = typeof icon === "string" ? icon : "HelpCircle";
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className="w-5 h-5" />;
};

export default function Callout({
  idCallout,
  onButtonClick,
}: {
  idCallout: TcalloutProps
  onButtonClick?: (mode: TformMode) => void
}): ReactElement {

  // Determine the layout type, defaulting to "classic" if not provided
  const Layout = idCallout.layout || "classic";

  return (
    <div
      className={`${Layout === "classic" ? "max-w-3xl" : "max-w-7xl"} mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8`}
    >
      {/* Render callout header with different styling based on layout */}
      {Layout === "classic" ? (
        <h2 className={cn("text-3xl font-extrabold sm:text-4xl", idCallout.variant || "text-secondary")}>
          <span className="block text-primary">{idCallout.header?.title}</span>
          <span className="block text-primary">{idCallout.header?.subtitle}</span>
        </h2>
      ) : (
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="block">{idCallout.header.title}</span>
          <span className="block text-primary/70">
            {idCallout.header.subtitle}
          </span>
        </h2>
      )}

      {/* Display an optional description text */}
      <p className="mt-4 text-lg leading-6 text-secondary">
        {idCallout.title}
      </p>

      {/* Render a list of bullet points if provided */}
      <ul className="mt-4 space-y-4">
        {idCallout.list?.map((iPoint, iIndex) => (
          <li key={iIndex} className={cn("text-lg", idCallout.variant || "text-secondary")}>
            {iPoint.label}
          </li>
        ))}
      </ul>

      {/* Display additional action text if available */}
      <p className={cn("mt-8 text-xl", idCallout.variant || "text-secondary")}>
        {idCallout.subtitle}
      </p>

      {/* Render callout buttons with appropriate behavior for link and Onclick actions */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
        {idCallout.buttons.map((idButton, index) => {
          // Construct button content, including an optional icon
          const ButtonContent = (
            <>
              {idButton.icon && idButton.iconPosition === "before" && (
                <span className="mr-2">{renderIcon(idButton.icon)}</span>
              )}
              {idButton.label}
              {idButton.icon && idButton.iconPosition === "after" && (
                <span className="ml-2">{renderIcon(idButton.icon)}</span>
              )}
            </>
          );

          return idButton.href ? (
            <Link href={idButton.href} key={`btn-${index}`}>
              <Button
                variant={idButton.variant || "default"}
                size={idButton.size || "lg"}
              >
                {ButtonContent}
              </Button>
            </Link>
          ) : (

            // Render a standard button with an event handler if no href is provided
            <Button
              key={`btn-${index}`}
              variant={idButton.variant || "default"}
              size={idButton.size || "lg"}
              onClick={() => {
                if (onButtonClick && idButton.formMode) {
                  onButtonClick(idButton.formMode)
                }
              }}
            >
              {ButtonContent}
            </Button>
          );
        })}
      </div>
    </div>
  )
}