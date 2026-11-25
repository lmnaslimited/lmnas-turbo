"use client";

import { useEffect, useState } from "react";
import CustomCard from "@repo/ui/components/custom-card";
import { TcardProps } from "@repo/middleware/types";

interface TtestimonialSliderProps {
  idTestimonials: TcardProps[];
}

export default function TestimonialSlider({
  idTestimonials,
}: TtestimonialSliderProps) {
  const [lActiveIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const LTotal = idTestimonials?.length ?? 0;

  // Automatically advance to the next testimonial.
  useEffect(() => {
    if (isPaused || LTotal <= 1) return;
    const LInterval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % LTotal);
    }, 3000);

    return () => window.clearInterval(LInterval);
  }, [isPaused, LTotal]);
  if (LTotal === 0) return null;

  // Navigate to the previous testimonial.
  const fnGoToPrevious = () => {
    setActiveIndex((current) => (current - 1 + LTotal) % LTotal);
  };

  // Navigate to the next testimonial.
  const fnGoToNext = () => {
    setActiveIndex((current) => (current + 1) % LTotal);
  };

  return (
    <div
      className="mt-12 w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setIsPaused(false);
        }
      }}
      aria-label="Customer testimonials"
    >
      <div className="flex items-center gap-3 md:gap-6">
        {/* Previous navigation */}
        <button
          type="button"
          onClick={fnGoToPrevious}
          disabled={LTotal <= 1}
          aria-label="Previous testimonial"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-accent disabled:opacity-40 md:h-12 md:w-12"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        {/* Sliding viewport */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            className="flex items-stretch transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${lActiveIndex * 100}%)`,
            }}
          >
            {idTestimonials.map((testimonial, index) => 
            (
                
              <div
                key={index}
                className="w-full min-w-0 shrink-0 self-stretch"
                style={{ flexBasis: "100%" }}
                aria-hidden={index !== lActiveIndex}
              >
                <CustomCard
                idCardProps={{
                    header: {
                    ...testimonial.header,
                    descripClass:
                        "text-base md:text-lg text-primary/80 mb-6 leading-relaxed line-clamp-none",
                    headingClass: "m-0",
                    },

                    className:
                    "w-full max-w-none h-full rounded-xl border border-border shadow-md",

                    avatar: testimonial.avatar,
                    avatarDetails: testimonial.avatarDetails,

                    tag: testimonial.tag,
                    category: testimonial.category,

                    namePosition: "bottom",
                    footerClassName: "items-start px-6 pb-6 pt-3",
                }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next navigation */}
        <button
          type="button"
          onClick={fnGoToNext}
          disabled={LTotal <= 1}
          aria-label="Next testimonial"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-accent disabled:opacity-40 md:h-12 md:w-12"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}