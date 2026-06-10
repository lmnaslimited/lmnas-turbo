import * as echarts from "echarts";
import { TchartData } from "@repo/middleware/types";

/**
 * Render an ECharts chart as an SVG string (SSR-friendly)
 */
export async function renderChartSvg(idData: TchartData) {
  // Initialize ECharts instance in SSR mode with SVG renderer
  const LdChart = echarts.init(null, null, {
    renderer: "svg",
    ssr: true,
    width: 800,
    height: 450,
  });

  // Build chart configuration and apply it
  LdChart.setOption(fnBuildOption(idData));

  // Convert chart to SVG string output
  const LSvg = LdChart.renderToSVGString();

   // Cleanup instance to avoid memory leaks
  LdChart.dispose();

  return LSvg;
}

/**
 * Builds ECharts option config based on chart type
 */
function fnBuildOption(idData: TchartData) {
  // Common configuration shared across all chart types
  const LdCommon = {
    title: {
      text: idData.title ?? "",
    },

    legend: {
      show: idData.options?.showLegend ?? true,
    },

    tooltip: {},
  };

  switch (idData.type) {
    case "bar":
      return {
        ...LdCommon,

        xAxis: {
          type: "category",
          data: idData.categories,
        },

        yAxis: {
          type: "value",
        },

        series: idData.series.map((item) => ({
          name: item.label,
          type: "bar",
          data: item.values,
        })),
      };

    case "line":
      return {
        ...LdCommon,

        xAxis: {
          type: "category",
          data: idData.categories,
        },

        yAxis: {
          type: "value",
        },

        series: idData.series.map((item) => ({
          name: item.label,
          type: "line",
          smooth: true,
          data: item.values,
          // Add this to show values next to line points
          label: {
            show: true,
            position: "top",
          },
        })),
      };

    case "area":
      return {
        ...LdCommon,

        xAxis: {
          type: "category",
          data: idData.categories,
        },

        yAxis: {
          type: "value",
        },

        series: idData.series.map((item) => ({
          name: item.label,
          type: "line",
          areaStyle: {},
          smooth: true,
          data: item.values,
          // Add this to show values above the area line
          label: {
            show: true,
            position: "top",
          },
        })),
      };

    case "stacked-bar":
      return {
        ...LdCommon,

        xAxis: {
          type: "category",
          data: idData.categories,
        },

        yAxis: {
          type: "value",
        },

        series: idData.series.map((item) => ({
          name: item.label,
          type: "bar",
          stack: "total",
          data: item.values,
        })),
      };

    case "stacked-area":
      return {
        ...LdCommon,

        xAxis: {
          type: "category",
          data: idData.categories,
        },

        yAxis: {
          type: "value",
        },

        series: idData.series.map((item) => ({
          name: item.label,
          type: "line",
          stack: "total",
          areaStyle: {},
          data: item.values,
        })),
      };

    case "pie":
      return {
        ...LdCommon,

        series: [
          {
            type: "pie",
            radius: "70%",
            label: {
              show: true,
              // {b} represents the name, {d} automatically calculates the percentage
              formatter: "{b}: {d}%", 
            },
            data: idData.categories.map((category, index) => ({
              name: category,
              value: idData.series[0]?.values[index] ?? 0,
            })),
          },
        ],
      };

      case "donut":
        return {
          ...LdCommon,
  
          series: [
            {
              type: "pie",
              radius: ["40%", "75%"],
              avoidLabelOverlap: true,
              label: {
                show: true,
                // {b} represents the name, {d} automatically calculates the percentage
                formatter: "{b}: {d}%", 
              },
              data: idData.categories.map((category, index) => ({
                name: category,
                value: idData.series[0]?.values[index] ?? 0,
              })),
            },
          ],
        };

    case "radar":
      return {
        ...LdCommon,

        radar: {
          indicator: idData.categories.map((category) => ({
            name: category,
            max: 100,
          })),
        },

        series: [
          {
            type: "radar",

            data: idData.series.map((item) => ({
              name: item.label,
              value: item.values,
            })),
          },
        ],
      };

    default:
      throw new Error(`Unsupported chart type: ${idData.type}`);
  }
}