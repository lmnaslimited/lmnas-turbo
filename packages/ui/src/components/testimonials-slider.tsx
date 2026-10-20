"use client";

import { useEffect, useState } from "react";
import CustomCard from "@repo/ui/components/custom-card";
import { TcardProps } from "@repo/middleware/types";

interface TestimonialSliderProps {
  testimonials: TcardProps[];
}

export default function TestimonialSlider({
  testimonials,
}: TestimonialSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = testimonials?.length ?? 0;

 console.log("All testimonials:", testimonials);

  // Automatically advance to the next testimonial.
  useEffect(() => {
    if (isPaused || total <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isPaused, total]);

  if (total === 0) return null;

  // Navigate to the previous testimonial.
  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  // Navigate to the next testimonial.
  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % total);
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
          onClick={goToPrevious}
          disabled={total <= 1}
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
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
          >
            {testimonials.map((testimonial, index) => 
            (
                
              <div
                key={index}
                className="w-full min-w-0 shrink-0 self-stretch"
                style={{ flexBasis: "100%" }}
                aria-hidden={index !== activeIndex}
              >
            <CustomCard
            idCardProps={{
                header: {
                ...testimonial.header,
                descripClass:
                    "text-lg md:text-xl text-primary/80 mb-8 leading-relaxed line-clamp-none",
                headingClass: "m-0",
                },
                className: "w-full max-w-none h-full",
                avatar: testimonial.avatar,
                avatarDetails: testimonial.avatarDetails,
                namePosition: "bottom",
                footerClassName: "items-start",
            }}
            />
              </div>
            ))}
          </div>
        </div>

        {/* Next navigation */}
        <button
          type="button"
          onClick={goToNext}
          disabled={total <= 1}
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