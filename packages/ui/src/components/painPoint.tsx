"use client";

import { useRef, useEffect } from "react";

export default function PainPoints({ industry }: { industry: any }) {
  const painPointsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-4");
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const painPoints = document.querySelectorAll(".pain-point");
    painPoints.forEach((point) => {
      observer.observe(point);
    });

    return () => {
      painPoints.forEach((point) => {
        observer.unobserve(point);
      });
    };
  }, []);

  return (
    <div ref={painPointsRef} className="space-y-12">
      {industry?.section2.items.map((point: any, index: number) => (
        <div
          key={index}
          className="pain-point opacity-0 translate-y-4 transition-all duration-500 ease-out border-b border-gray-200 pb-8"
        >
          <div className="flex items-start gap-6">
            <div className="bg-muted p-3 rounded-full">
              {point.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary">
                {point.question}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {point.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
