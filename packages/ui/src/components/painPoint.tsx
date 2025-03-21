"use client";

import { useRef, useEffect } from "react";
import { Titems } from "../type.js";

export default function PainPoints({ idItems }: { idItems: Titems[] }) {
  const PainPointsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const Observer = new IntersectionObserver(
      (laEntries) => {
        laEntries.forEach((idEntry) => {
          if (idEntry.isIntersecting) {
            idEntry.target.classList.add("opacity-100", "translate-y-0");
            idEntry.target.classList.remove("opacity-0", "translate-y-4");
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const PainPoints = document.querySelectorAll(".pain-point");
    PainPoints.forEach((iPoint) => {
      Observer.observe(iPoint);
    });

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
          className="pain-point opacity-0 translate-y-4 transition-all duration-500 ease-out border-b border-gray-200 pb-8"
        >
          <div className="flex items-start gap-6">
            <div className="bg-muted p-3 rounded-full">
              {idPoint.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary">
                {idPoint.question}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {idPoint.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
