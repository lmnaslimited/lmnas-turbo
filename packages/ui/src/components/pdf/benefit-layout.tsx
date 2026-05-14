"use client";

import { Document, Link, Page, Text, View } from "@react-pdf/renderer";

import {
  TbenefitPdfContent,
  TbenefitPdfData,
} from "@repo/middleware/types";


type TBenefitPdfDocumentProps = {
  idData: TbenefitPdfData;
  idContent: TbenefitPdfContent;
};

const styles = {
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 700,
  },

  bodyText: {
    fontSize: 11,
    lineHeight: 1.7,
    color: "#374151",
  },

  mutedText: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.5,
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignSelf: "flex-start" as const,
    marginTop: 14,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 11,
    textDecoration: "none" as const,
  },
};

export function BenefitPdfDocument({
  idData,
  idContent,
}: TBenefitPdfDocumentProps) {
  const LScore = Number(idData?.result?.score || 0);

  return (
    <Document>
      <Page
        size="A4"
        style={{
          padding: 40,
          fontSize: 11,
          lineHeight: 1.5,
          fontFamily: "Helvetica",
          backgroundColor: "#ffffff",
          color: "#111827",
        }}
      >

        {/* HEADER */}
        <View style={{ marginBottom: 30 }}>

          <Text
            style={{
              fontSize: 22,
              marginBottom: 18,
              fontWeight: 700,
            }}
          >
            {idContent?.header?.title}
          </Text>

          <Text
            style={{
              fontSize: 12,
              marginBottom: 6,
              color: "#4b5563",
            }}
          >
            {idContent?.header?.subtitle}
          </Text>

          <Text
            style={{
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            {idContent?.header?.highlight}:{" "}
            {new Date().toLocaleDateString()}
          </Text>

        </View>

        {/* SECTIONS */}
        {idContent?.sections?.map((section, index) => (

          <View key={index} style={{ marginBottom: 24 }}>

            <Text style={styles.sectionTitle}>
              {section.header?.title}
            </Text>

            {section.list?.map((item, i) => (

              <Text
                key={i}
                style={{
                  ...styles.bodyText,
                  marginBottom: 10,
                }}
              >
                {item.description} {LScore}
              </Text>

            ))}

          </View>

        ))}

        {/* USER RESPONSES */}
        <View style={{ marginBottom: 20 }}>

          <Text style={styles.sectionTitle}>
            {idContent?.performanceAndUserAnswer?.subtitle}
          </Text>

          {Object.entries(idData?.answers || {}).map(
            ([iQuestion, iAnswer]) => {

              const LFormattedQuestion = iQuestion
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              return (

                <View
                  key={iQuestion}
                  style={{
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f3f4f6",
                  }}
                >

                  <Text style={styles.bodyText}>
                    <Text style={{ fontWeight: 700 }}>
                      {LFormattedQuestion}:
                    </Text>{" "}
                    {String(iAnswer)}
                  </Text>

                </View>

              );
            }
          )}

        </View>

        {/* PERFORMANCE INDICATORS */}
          <View style={{ marginBottom: 30 }}>

          <Text style={styles.sectionTitle}>
            {idContent?.performanceAndUserAnswer?.title}
          </Text>

          {idContent?.performanceAndUserAnswer?.list?.map((item, index) => {

            const LPercentage = Number(
              item.description?.replace("%", "") || 0
            );

            const LColors = [
              "#2563eb", // blue
              "#16a34a", // green
              "#f59e0b", // orange
              "#dc2626", // red
              "#7c3aed", // purple
              "#0891b2", // cyan
            ];

            const LBarColor = LColors[index % LColors.length];

            return (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    marginTop: 10
                  }}
                >

                  <Text
                    style={{
                      ...styles.bodyText,
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={{
                      ...styles.bodyText,
                      color: LBarColor,
                      fontWeight: 700,
                    }}
                  >
                    {item.description}
                  </Text>

                </View>

                {/* OUTER BAR */}
                <View
                  style={{
                    height: 12,
                    width: "100%",
                    backgroundColor: "#e5e7eb",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >

                  {/* INNER BAR */}
                  <View
                    style={{
                      width: `${LPercentage}%`,
                      height: "100%",
                      backgroundColor: LBarColor,
                    }}
                  />

                </View>
              </View>
            );
          })}

          </View>

        {/* ANALYSIS */}
        <View style={{ marginBottom: 28 }}>

          <Text style={styles.sectionTitle}>
            {idContent?.analysis?.title}
          </Text>

          {idContent?.analysis?.list?.map((item, index) => (

            <Text
              key={index}
              style={{
                ...styles.bodyText,
                marginBottom: 10,
              }}
            >
              {item.description}
            </Text>

          ))}

        </View>

        {/* SCORE OVERVIEW */}
        <View style={{ marginBottom: 32 }}>

          <Text style={styles.sectionTitle}>
            {idContent?.scoreOverview?.title}
          </Text>

          <Text
            style={{
              fontSize: 38,
              marginBottom: 24,
              fontWeight: 700,
            }}
          >
            {LScore}%
          </Text>

          {/* OUTER BAR */}
          <View
            style={{
              height: 14,
              width: "100%",
              backgroundColor: "#00FF00",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >

            {/* INNER BAR */}
            <View
              style={{
                width: `${LScore}%`,
                height: "100%",
                backgroundColor: "#2563eb",
              }}
            />

          </View>

          <Text
            style={{
              marginTop: 10,
              fontSize: 10,
              color: "#6b7280",
            }}
          >
            {idContent?.scoreOverview?.subtitle}
          </Text>

        </View>

        {/* CTA SECTION */}
        <View
          style={{
            marginTop: 10,
            marginBottom: 34,
            padding: 24,
            backgroundColor: "#f3f4f6",
            borderRadius: 10,
          }}
        >

          <Text style={styles.sectionTitle}>
            {idContent?.ctaSection?.header?.title}
          </Text>

          {idContent?.ctaSection?.list?.map((item, i) => (

            <Text
              key={i}
              style={{
                ...styles.bodyText,
                marginBottom: 8,
              }}
            >
              {item.description}
            </Text>

          ))}

          {idContent?.ctaSection?.buttons?.map((btn, i) => (

            <Link
              key={i}
              href={btn.href ?? "#"}
              style={styles.button}
            >

              <Text style={styles.buttonText}>
                {btn.label}
              </Text>

            </Link>

          ))}

        </View>

        {/* NEXT STEPS */}
        <View style={{ marginBottom: 28 }}>

          <Text style={styles.sectionTitle}>
            {idContent?.nextSteps?.header?.title}
          </Text>

          {idContent?.nextSteps?.list?.map((item, i) => (

            <Text
              key={i}
              style={{
                ...styles.bodyText,
                marginBottom: 6,
              }}
            >
              • {item.description}
            </Text>

          ))}

        </View>

        {/* FOOTER */}
        <View
          style={{
            marginTop: 40,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          }}
        >

          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {idContent?.footer?.title}
          </Text>

          <Text style={styles.mutedText}>
            {idContent?.footer?.subtitle}
          </Text>

        </View>

      </Page>
    </Document>
  );
}