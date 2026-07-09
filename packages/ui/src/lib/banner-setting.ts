import {
    TbannerTarget,
    TcalloutProps,
  } from "@repo/middleware/types";
  
  export function getActiveBanner(
    bannerTarget: TbannerTarget | null,
    currentPath: string
  ): TcalloutProps | null {
    const settings = bannerTarget?.bannerSetting;
  
    if (!settings) return null;
  
    // Global banner takes precedence
    if (settings.forAllPages) {
    
      return settings.gobalBannerContent ?? null;
    }
  
    const normalizedPath = currentPath.trim().toLowerCase();
  console.log("path", normalizedPath)
    return (
      settings.specificPageControl?.find(
        (item) => item.title?.trim().toLowerCase() === normalizedPath
      ) ?? null
    );
  }