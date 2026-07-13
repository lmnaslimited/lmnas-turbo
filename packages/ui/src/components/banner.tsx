"use client";

import { TbannerTarget } from "@repo/middleware/types";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveBanner } from "../lib/banner-setting";

export default function Banner({
  idBanner,
}: {
  idBanner: TbannerTarget;
}) {
  const LPathname = usePathname();

  const LSegments = LPathname.split("/").filter(Boolean);

  // Get the page name like pricing, contact etc
  const LPageKey = LSegments.slice(1).join("/") || "/";

  // call the helper to control banner to be visisble or not
  // for the current page
  const LdBanner = getActiveBanner(idBanner, LPageKey);

  if (!LdBanner) return null;

  return (
    <div className="w-full border-b border-white/10 bg-[#1A3C5D] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-3 md:flex-row md:gap-6 md:py-3">

        {/* Text */}
        <div className="flex items-center justify-center gap-2 text-center">
          <Sparkles className="hidden h-4 w-4 shrink-0 text-[#4BADE9] sm:block" />

          <p className="text-sm font-medium sm:text-base">
            {LdBanner.subtitle}
          </p>
        </div>

        {/* Buttons*/}
        {LdBanner.buttons?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {LdBanner.buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href ?? "#"}
                className="group inline-flex items-center gap-1.5 rounded-full bg-[#225AA0] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#2d6cb8]"
              >
                {button.label}

                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}