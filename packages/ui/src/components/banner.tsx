"use client";

import { TbannerTarget } from "@repo/middleware/types";
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
    <div className="w-full bg-gradient-to-r from-primary to-primary/50 py-3 px-4 text-sm font-medium">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <span className="flex-1">{banner.subtitle}</span>

        {banner.buttons?.length > 0 && (
          <div className="flex gap-3">
            {banner.buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href ?? "#"}
                className="font-bold underline underline-offset-4 hover:opacity-80"
              >
                {button.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}