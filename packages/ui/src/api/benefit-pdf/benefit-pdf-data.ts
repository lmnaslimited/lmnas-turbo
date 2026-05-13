import { NextResponse } from "next/server";

export async function GetBenefitPdfData() {
  return NextResponse.json({
    locale: "en",
    benefit_type: "roi_calculator",

    content: {
      header: {
        title: "BUSINESS BENEFITS ASSESSMENT REPORT",
        subtitle: "Prepared By: LMNAs Cloud Solutions",
        highlight: "Generated On",
      },

      sections: [
        {
          header: {
            title: "Operational Efficiency & Business Impact Analysis",
          },
          list: [
            {
              description:
                "This report provides a summarized assessment based on the information submitted through the benefit evaluation form. The purpose of this document is to present a high-level overview of the current assessment score, submitted responses, and general recommendations for improvement.",
            },
          ],
          buttons: [],
        },
    
        {
          header: {
            title: "Executive Summary",
          },
          list: [
            {
              description:
                "The selected assessment category for this report is ROI Calculator. Based on the submitted information, the calculated overall assessment score is.",
            },
          ],
          buttons: [],
        },
    
      ],

      performanceAndUserAnswer: {
        title: "Performance Indicators",
        subtitle: "Summitted Response",
        list: [
          {
            label: "Revenue Efficiency",
            description: "75%",
          },
          {
            label: "Operational Readiness",
            description: "60%",
          },
          {
            label: "Benefit Utilization",
            description: "85%",
          },
        ],
        buttons: [],
      },

      analysis: {
       
        title: "Assessment Analysis",
        
        list: [
          {
            description:
              "The assessment result has been generated using the submitted responses and predefined evaluation criteria. This report is intended to provide a directional overview rather than a final business or financial recommendation.",
          },
          {
            description:
              "Organizations with higher assessment scores generally demonstrate stronger operational alignment, improved efficiency, and better optimization of available business benefits and resources.",
          },
          {
            description:
              "Lower assessment scores may indicate opportunities for process improvements, strategic adjustments, or additional operational reviews.",
          },
        ],
        buttons: [],
      },

      recommendations: [
        {
          min: 80,
          max: 100,
          message:
            "The assessment indicates a strong level of benefit optimization and operational efficiency.",
        },
        {
          min: 60,
          max: 79,
          message:
            "The assessment shows a good level of performance with several areas that can be optimized further.",
        },
        {
          min: 40,
          max: 59,
          message: "The assessment highlights moderate performance levels.",
        },
        {
          min: 0,
          max: 39,
          message:
            "The assessment indicates significant improvement opportunities.",
        },
      ],

      scoreOverview: {
        title: "Assessment Score Overview",
        subtitle:
          "Overall business benefit optimization score based on submitted inputs.",
      },

      ctaSection: {
        header: {
          title: "Interested in Improving Your Business Performance?",
        },
        list: [
          {
            description:
              "Our specialists can help you identify optimization opportunities.",
          },
          {
            description:
              "We streamline operational workflows and maximize business value through tailored consultation.",
          },
        ],
        buttons: [
          {
            label: "BOOK A CONSULTATION",
            href: "/contact",
            variant: "default",
          },
        ],
      },

      nextSteps: {
        header: {
          title: "Recommended Next Steps",
        },
        list: [
          {
            description: "Review the submitted assessment inputs internally.",
          },
          {
            description:
              "Identify operational areas with the highest improvement potential.",
          },
          {
            description:
              "Consider conducting a detailed consultation or advanced evaluation.",
          },
          {
            description:
              "Reassess periodically to measure improvement progress over time.",
          },
        ],
        buttons: [],
      },

      footer: {
        title: "Disclaimer",
        subtitle:
          "This report is generated automatically based on the submitted information and should be used for informational purposes only.",
      },
    },
  });
}