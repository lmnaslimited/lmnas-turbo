import { Document, Page, Text, View, Link, Image } from "@react-pdf/renderer";
import { styles, PhoneIcon, MailIcon, LocationIcon, GlobeIcon, LinkedInIcon, YouTubeIcon, TwitterIcon } from "./detailed-casestudy-style"

/**
 * Contract for all block renderers.
 * Every renderer must implement a `render` method
 * that converts a data block into React nodes.
 */
interface IBlockRenderer {
  render(idBlock: any, iIndex: number): React.ReactNode;
}

/**
 * Base class for all block renderers.
 * Provides shared helper utilities (like safe text handling).
 */
abstract class clBaseBlockRenderer implements IBlockRenderer {
   /**
   * Each concrete renderer must implement this method
   * to return the React element for the given block.
   */
  abstract render(idBlock: any, iIndex: number): React.ReactNode;

  /**
   * Safely returns text value or empty string
   * to avoid rendering undefined/null in UI.
   */
  protected text(iValue: any) {
    return iValue ?? "";
  }
}

/**
 * Renders CTA (Call-To-Action) blocks.
 * Displays description text and a clickable link button.
 */
class clCtaRenderer extends clBaseBlockRenderer {
  render(idBlock: any, iIndex: number) {
    return (
      <View key={iIndex} style={styles.ctaBox} wrap={false}>
         {/* CTA description text */}
        <Text style={styles.ctaText}>
          {this.text(idBlock.Button.description)}
        </Text>
         {/* CTA button link */}
        <Link src={idBlock.Button.href} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>
            {idBlock.Button.label}
          </Text>
        </Link>
      </View>
    );
  }
}

/**
 * Renders tabular data into a structured table format.
 * Includes header row and multiple body rows.
 */
class clTableRenderer extends clBaseBlockRenderer {
  render(idBlock: any, iIndex: number) {
    const LdTable = idBlock.content;

    return (
      <View key={iIndex} style={{ marginTop: 10, marginBottom: 20 }}>
        <View style={styles.tableHeaderRow}>
          {LdTable.columns.map((idCol: any, iIndex: number) => (
            <View key={iIndex} style={styles.tableHeaderCell}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>
                {idCol.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Table Body Rows */}
        {LdTable.rows.map((idRow: any, iRowIndex: number) => (
          <View key={iRowIndex} style={styles.tableBodyRow} wrap={false}>
            {LdTable.columns.map((idCol: any, iColIndex: number) => (
              <View key={iColIndex} style={styles.tableCell}>
                <Text style={styles.cellText}>
                  {idRow[idCol.key]}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }
}

/**
 * Renders a simple vertical bar chart.
 * Computes relative bar heights based on dataset max value.
 */
class clBarChartRenderer extends clBaseBlockRenderer {
  render(idBlock: any, iIndex: number) {
    idBlock = idBlock.content
    const LaValues = idBlock.data.map((d: any) => d.value || 0);
    const LMax = Math.max(...LaValues, 1); // prevent division by zero
    const LHeight = 140;

    return (
      <View key={iIndex} style={{ marginTop: 20, padding: 10 }}>
        <View style={{ flexDirection: "row" }}>

          {/* Y axis */}
          <View style={{ width: 30, height: LHeight, justifyContent: "space-between" }}>
            {[1, 0.75, 0.5, 0.25, 0].map((iTab, iIndex) => (
              <Text key={iIndex} style={{ fontSize: 8 }}>
                {Math.round(LMax * iTab)}
              </Text>
            ))}
          </View>

          {/* Bars */}
          <View style={{
            flex: 1,
            height: LHeight,
            flexDirection: "row",
            alignItems: "flex-end",
          }}>
            {idBlock.data.map((idItem: any, iIndex: number) => {
              const LBarHeight = (idItem.value / LMax) * (LHeight - 10);

              return (
                <View key={iIndex} style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 18,
                      height: LBarHeight,
                      backgroundColor: "#0f4c81",
                    }}
                  />
                  <Text style={{ fontSize: 8 }}>{idItem.label}</Text>
                </View>
              );
            })}
          </View>

        </View>
      </View>
    );
  }
}

/**
 * Renders paragraph blocks with support for inline structured nodes.
 * Delegates rendering of each node to InlineRendererFactory.
 */
class clParagraphRenderer extends clBaseBlockRenderer {
  render(idBlock: any, iIndex: number) {
    const LdBlock = idBlock.paragraph
    return(
    <View key={iIndex}>
      {LdBlock?.map((idNode: any, iEleIndex: number) => (
        <View key={iEleIndex}>
          {clInlineRendererFactory.get(idNode.type).render(idNode, iEleIndex)}
        </View>
      ))}
    </View>
    )
  }
}

/**
 * Renders inline bold or normal text nodes inside paragraphs/lists.
 * Used as the smallest atomic inline unit.
 */
class clTextInLine extends clBaseBlockRenderer {
  render(idBlock: any, iIndex: number) {
    return (
      <Text key={iIndex} style={idBlock.bold ? { fontWeight: "bold" } : undefined}>
        {this.text(idBlock.text)}
      </Text>
    );
  }
}

/**
 * Renders a paragraph composed of multiple inline nodes.
 * Each child node is delegated to the inline renderer factory.
 */
class clParagraphInLine extends clBaseBlockRenderer {
  render(idBlock: any, iIndex: number) {
    return (
      <Text key={iIndex} style={styles.paragraph}>
        {idBlock.children?.map((idChild: any, iEleIndex: number) =>
          clInlineRendererFactory.get(idChild.type).render(idChild, iEleIndex)
        )}
      </Text>
    );
  }
}

/**
 * Renders list items as inline paragraph-style text.
 * Prefixes bullet point and supports inline child formatting.
 */
class clListItemInLIne extends clBaseBlockRenderer {
  render(idBlock: any, iIndex: number) {
    return (
      <Text key={iIndex} style={styles.paragraph}>
        •{" "}
        {idBlock.children?.map((idChild: any, iEleIndex: number) =>
          clInlineRendererFactory.get(idChild.type).render(idChild, iEleIndex)
        )}
      </Text>
    );
  }
}

/**
 * Renders contact section (footer block).
 * Includes phone, address, email, website, and social links.
 */
class clContactRenderer extends clBaseBlockRenderer{
  render(idData:any, iIndex:number) {
    const LdContact = idData.footer.contact;
    const LdSocial = idData.footer.social;

    return (
      <View
        style={{
          marginTop: 30,
          paddingTop: 15,
          borderTopWidth: 1,
          borderColor: "#ddd",
        }}
        wrap={false} // Prevent footer from splitting across pages
      >
        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
          CONTACT
        </Text>

        {/* PHONE */}
        <View style={styles.contactRow}>
          <View style={styles.iconBox}>
            <PhoneIcon />
          </View>

          <Link src={`tel:${LdContact.phoneHref}`} style={styles.contactText}>
            {LdContact.phoneHref}
          </Link>
        </View>

        {/* ADDRESS */}
        <View style={styles.contactRow}>
          <View style={styles.iconBox}>
            <LocationIcon />
          </View>

          <Text style={styles.contactText}>
            {LdContact.address}
          </Text>
        </View>

        {/* EMAIL */}
        <View style={styles.contactRow}>
          <View style={styles.iconBox}>
            <MailIcon />
          </View>

          <Link src={`mailto:${LdContact.emailHref}`} style={styles.contactText}>
            {LdContact.emailHref}
          </Link>
        </View>

        {/* WEBSITE */}
        <View style={styles.contactRow}>
          <View style={styles.iconBox}>
            <GlobeIcon />
          </View>

          <Link src={LdContact.websiteHref} style={styles.contactText}>
            {LdContact.websiteHref}
          </Link>
        </View>

        {/* SOCIAL */}
        <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
          {LdSocial.map((idItem: any, iSocIndex: number) => {
            const LIcon = clSocialIconFactory.get(idItem.icon);

            return (
              LIcon && (
                <Link key={iSocIndex} src={idItem.href}>
                  {LIcon}
                </Link>
              )
            );
          })}
        </View>
      </View>
    );
  }
}

/**
 * Factory for rendering social media icons.
 * Maps icon type string → React icon component.
 */
class clSocialIconFactory {
  private static registry: Record<string, React.ReactNode> = {
    Linkedin: <LinkedInIcon />,
    Youtube: <YouTubeIcon />,
    Twitter: <TwitterIcon />,
  };

  static get(type: string): React.ReactNode | null {
    return this.registry[type] ?? null;
  }
}

/**
 * Factory for inline renderer selection.
 * Used inside paragraphs/lists to resolve node types dynamically.
 */
class clInlineRendererFactory {
  private static registry: Record<string, clBaseBlockRenderer> = {
    text: new clTextInLine(),
    paragraph: new clParagraphInLine(),
    "list-item": new clListItemInLIne(),
  };

  static get(type: string): clBaseBlockRenderer {
    return this.registry[type] ?? new clParagraphInLine();
  }
}

/**
 * Factory for top-level block rendering.
 * Maps block types (CTA, table, chart, paragraph, contact) to renderers.
 */
class clBlockRendererFactory {
  private static registry: Record<string, IBlockRenderer> = {
    cta: new clCtaRenderer(),
    table: new clTableRenderer(),
    barChart: new clBarChartRenderer(),
    paragraph: new clParagraphRenderer(),
    contact: new clContactRenderer()
  };

  static get(type: string): IBlockRenderer {
    return this.registry[type] ?? new clParagraphRenderer();
  }
}

/**
 * Main PDF document renderer.
 * Iterates over case study blocks and delegates rendering
 * to appropriate block renderers via factory pattern.
 */
export const DetailedPdf = ({ idData }: { idData: any }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
      <View style={styles.brandHeader}>
         {/* BRAND HEADER */}
        <View style={styles.logoWrapper}>
          <Image
            src="https://raw.githubusercontent.com/lmnaslimited/lmnas-website-images/refs/heads/main/Logo/LMNAS-White-Black-plain-rounded.png"
            style={styles.logo}
          />
        </View>

        <Text style={styles.brandText}>
          LMNAs Cloud Solution
        </Text>
      </View>
       {/* HEADER DECORATION */}
      <View style={styles.header}>
        <View style={styles.headerAccent} />
        <View style={styles.headerCircle} />
      </View>
        <Text style={styles.title}>
          {idData?.caseStudies[0]?.problemSection.header.title || "Case Study"}
        </Text>

        {idData?.caseStudies[0]?.pdfDownloadContent?.map(
          (idSection: any, iIndex: number) => {
            const renderer = clBlockRendererFactory.get( idSection.type?idSection.type : idSection.cta );

            return (
              <View key={iIndex}>
                {idSection.sectionName && (
                  <Text style={styles.sectionTitle}>
                    {idSection.sectionName}
                  </Text>
                )}

                {renderer.render(idSection, iIndex)}
              </View>
            );
          }
        )}
         {/* FOOTER CONTACT SECTION (ALWAYS LAST) */}
        {clBlockRendererFactory.get("contact").render(idData, 0)}
      </Page>
    </Document>
  );
};