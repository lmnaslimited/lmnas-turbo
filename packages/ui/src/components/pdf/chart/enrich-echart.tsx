import sharp from "sharp";
import { renderChartSvg } from "./echart-generator";

/**
 * Converts chart sections inside PDF content into image (PNG base64)
 * so they can be rendered inside PDF generators that don't support SVG charts.
 */
export async function enrichCharts(idPdfData: any) {
  const LaContent =
    idPdfData?.caseStudies?.[0]?.pdfDownloadContent ?? [];

  /**
   * Process all content blocks:
   * - If not a chart → return as-is
   * - If chart → render SVG → convert to PNG → embed as base64 image
   */
  const LaEnrichedContent = await Promise.all(
    LaContent.map(async (idSection: any) => {
      if (idSection.type !== "chart") {
        return idSection;
      }

      try {
         /**
       * 1. Render chart as SVG string using ECharts (SSR)
       */
        const LSvg = await renderChartSvg(idSection.content.data);

        if (!LSvg) {
          throw new Error("Empty SVG output");
        }
         /**
       * 2. Convert SVG string into PNG buffer using Sharp
       */
        const LPngBuffer = await sharp(Buffer.from(LSvg))
          .png()
          .toBuffer();
         /**
       * 3. Convert PNG buffer to base64 data URL
       *    (usable inside PDF/image components)
       */
        return {
          ...idSection,
          chartImage: `data:image/png;base64,${LPngBuffer.toString("base64")}`,
        };
      } catch (err) {
        // Log for developers only
        console.error("Chart render failed (silent fallback):", err);

        // Safe fallback for UI / PDF
        return {
          ...idSection,
          chartImage: null, // or fallback image
        };
      }
    })
  );
  /**
   * Return updated PDF structure with enriched chart content
   * replacing original chart blocks with image-based ones
   */
  return {
    ...idPdfData,
    caseStudies: [
      {
        ...idPdfData.caseStudies[0],
        pdfDownloadContent: LaEnrichedContent,
      },
    ],
  };
}