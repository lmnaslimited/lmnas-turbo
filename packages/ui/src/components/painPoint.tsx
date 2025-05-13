"use client";
import { useRef, useEffect, ReactElement } from "react";
import { Titems, Tbutton } from "@repo/middleware";
import { getIconComponent } from "@repo/ui/lib/icon";

const renderIcon = (icon: Tbutton['icon']) => {
  const iconName = typeof icon === "string" ? icon : "HelpCircle";
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className="w-6 h-6" />;
};

// PainPoints Component: Displays a list of pain points with a smooth fade-in animation when they enter the viewport.
export default function PainPoints({ idItems }: { idItems: Titems[] }): ReactElement {
  const PainPointsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Creates an Intersection Observer to track when elements enter the viewport
    const Observer = new IntersectionObserver(
      (laEntries) => {
        laEntries.forEach((idEntry) => {
          // If the element is visible in the viewport, apply the fade-in effect
          if (idEntry.isIntersecting) {
            idEntry.target.classList.add("opacity-100", "translate-y-0");
            idEntry.target.classList.remove("opacity-0", "translate-y-4");
          }
        });
      },
      {
        root: null, // Uses the viewport as the root
        rootMargin: "0px", // No additional margins
        threshold: 0.1, // Element must be at least 10% visible to trigger
      }
    );

    // Select all elements with the class "pain-point" and observe them
    const PainPoints = document.querySelectorAll(".pain-point");
    PainPoints.forEach((iPoint) => {
      Observer.observe(iPoint);
    });

    // Cleanup: Unobserve elements when the component unmounts
    return () => {
      PainPoints.forEach((iPoint) => {
        Observer.unobserve(iPoint);
      });
    };
  }, []);

  return (
    <div ref={PainPointsRef} className="space-y-12">
      {idItems.map((idPoint: Titems, index: number) => (
        <div
          key={index}
          className="pain-point opacity-0 translate-y-4 transition-all duration-500 ease-out border-b border-border pb-8"
        >
          <div className="flex items-start gap-6">
            <div className="bg-muted p-3 rounded-full">
              {renderIcon(idPoint.icon)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary">
                {idPoint.label}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {idPoint.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}