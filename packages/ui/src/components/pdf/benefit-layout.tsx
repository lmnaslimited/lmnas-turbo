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
          lineHeight: 1.6,
          fontFamily: "Helvetica",
        }}
      >
        {/* HEADER */}
        <View style={{ marginBottom: 25 }}>
          <Text
            style={{
              fontSize: 24,
              marginBottom: 20,
            }}
          >
            {idContent?.header?.title}
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              {idContent?.header?.subtitle}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              {idContent?.header?.highlight}:{" "}
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {idContent?.sections?.map((section, index) => (
          <View key={index} style={{ marginBottom: 24 }}>
            
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              {section.header?.title}
            </Text>

            {section.list?.map((item, i) => (
              <Text key={i} style={{ marginBottom: 8 }}>
                {item.description}
              </Text>
            ))}

          </View>
        ))}
        {/* USER RESPONSES */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            {idContent?.performanceAndUserAnswer?.subtitle}
          </Text>

          {Object.entries(idData?.answers || {}).map(
            ([iQuestion, iAnswer]) => {
              const LFormattedQuestion = iQuestion
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              return (
                <View key={iQuestion} style={{ marginBottom: 10 }}>
                  <Text>
                    {LFormattedQuestion}: {String(iAnswer)}
                  </Text>
                </View>
              );
            }
          )}
        </View>

        {/* PERFORMANCE INDICATORS */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, marginBottom: 14 }}>
            {idContent?.performanceAndUserAnswer?.title}
          </Text>

          {idContent?.performanceAndUserAnswer?.list?.map((item, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text>{item.label}</Text>
              <Text>{item.description}</Text>
            </View>
          ))}
        </View>

        {/* ANALYSIS */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            {idContent?.analysis?.title}
          </Text>

          {idContent?.analysis?.list?.map((item, index) => (
            <Text key={index} style={{ marginTop: index === 0 ? 0 : 10 }}>
              {item.description}
            </Text>
          ))}
        </View>

        {/* SCORE VISUALIZATION */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 10,
            }}
          >
            {idContent?.scoreOverview?.title}
          </Text>

          <Text
            style={{
              fontSize: 28,
              marginBottom: 16,
            }}
          >
            {LScore}%
          </Text>

          {/* OUTER BAR */}
          <View
            style={{
              height: 18,
              width: "100%",
              backgroundColor: "#e5e7eb",
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
              marginTop: 8,
              fontSize: 10,
            }}
          >
            {idContent?.scoreOverview?.subtitle}
          </Text>
        </View>

       {/* CTA SECTION */}
       <View style={{
          marginTop: 20,
          marginBottom: 30,
          padding: 24,
          backgroundColor: "#f3f4f6",
        }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            {idContent?.ctaSection?.header?.title}
          </Text>

          {idContent?.ctaSection?.list?.map((item, i) => (
            <Text key={i} style={{ marginBottom: 6 }}>
              {item.description}
            </Text>
          ))}

          <View style={{ marginTop: 10 }}>
            {idContent?.ctaSection?.buttons?.map((btn, i) => (
              <View key={i} style={{ backgroundColor: "#2563eb", padding: 10 }}>
                <Link href={btn.href}>
                  <Text style={{ color: "#fff" }}>{btn.label}</Text>
                </Link>
              </View>
            ))}
          </View>
        </View>
        {/* NEXT STEPS */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            {idContent?.nextSteps?.header?.title}
          </Text>

          {idContent?.nextSteps?.list?.map((item, i) => (
            <Text key={i}>• {item.description}</Text>
          ))}
        </View>
        {/* FOOTER */}
        <View style={{ marginTop: 40 }}>
          <Text>{idContent?.footer?.title}</Text>

          <Text style={{ marginTop: 6 }}>
            {idContent?.footer?.subtitle}
          </Text>
        </View>
      </Page>
    </Document>
  );
}