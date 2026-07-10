import {
    TbannerTarget,
    TcalloutProps,
  } from "@repo/middleware/types";
  
  export function getActiveBanner(
    idBannerTarget: TbannerTarget | null,
    iCurrentPath: string
  ): TcalloutProps | null {
    const Ldsettings = idBannerTarget?.bannerSetting;
  
    // Return early if no banner configuration exists
    if (!Ldsettings) return null;
  
    // Normalize the current route for case-insensitive comparison
    const LNormalizedPath = iCurrentPath.trim().toLowerCase();
  
    // Check whether a page-specific banner is configured for the current route
    const LdSpecificBanner = Ldsettings.specificPageControl?.find(
      (idItem) => idItem.title?.trim().toLowerCase() === LNormalizedPath
    );

    // Give priority to the page-specific banner
    if (LdSpecificBanner) {
      return LdSpecificBanner;
    }
  
    // Fall back to the global banner if it is enabled
    if (Ldsettings.forAllPages) {
      return Ldsettings.gobalBannerContent ?? null;
    }
  
    // No banner should be displayed
    return null;
  }