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
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  // Remove locale
  const pageKey = segments.slice(1).join("/");

  const banner = getActiveBanner(idBanner, pageKey);

  if (!banner) return null;

  return (
    <div className="w-full border-b border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 text-center">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="hidden h-4 w-4 shrink-0 opacity-70 sm:inline-block" />
          <span>{banner.subtitle}</span>
        </p>

        {banner.buttons?.length > 0 && (
          <div className="flex items-center gap-2">
            {banner.buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href ?? "#"}
                className="group inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ring-primary-foreground/20 transition-colors hover:bg-primary-foreground/20"
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