import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import { TcaseStudies } from "@repo/middleware/types";
import { CallIcon, CalendarIcon, LinkedInIcon, YouTubeIcon, TwitterIcon } from "./detailed-casestudy-style"
//custom styles for react-pdf/renderer
const LdStyles = StyleSheet.create({
  page: {
    flexDirection: "row",
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  leftColumn: {
    width: "50%",
    paddingRight: 20,
  },
  rightColumn: {
    width: "50%",
    paddingLeft: 20,
  },
  image: {
    width: "100%",
    height: 160,
    marginBottom: 10,
    objectFit: "cover",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 6,
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#444",
  },
  subheading: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#444",
  },
  paragraph: {
    marginBottom: 6,
    lineHeight: 0.75,
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 6,
  },
  divider: {
    marginVertical: 6,
    height: 1,
    width: 60,
    backgroundColor: "#B88C5A",
  },
  link: {
    color: "#1a73e8",
    marginBottom: 6,
  },
  icon: {
    width: 14,
    height: 14,
    margin: 8,
  },
  contact: {
    marginTop: 10,
    gap: 6,
  },
  contactLink: {
    textDecoration: "none",
    color: "#2563EB",
    marginBottom: 4,
    fontSize: 10,
  },
  socialRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 10,
  },
  iconLink: {
    marginRight: 10,
    textDecoration: "none",
  },
  // CTA Button Styles
  ctaSection: {
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#EAEAEA",
    borderRadius: 6,
  },
  ctaHeading: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 6,
  },
  cta: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    textDecoration: "none",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 6,
  },
});

export const PdfDocument = ({ idData }: { idData: TcaseStudies }) => (
  <Document>
    <Page size="A4" style={LdStyles.page}>
      {/* Left Column */}

      <View style={LdStyles.leftColumn}>
        {/* image */}
        <Image style={LdStyles.image} src={idData.caseStudies[0]?.heroSection.image?.source} />

        {/* title */}
        <Text style={LdStyles.sectionTitle}>
          {idData.caseStudies[0]?.problemSection.header.title}
        </Text>

        {/* Business Challenge */}
        <Text style={LdStyles.heading}>BUSINESS CHALLENGES</Text>
        {idData.caseStudies[0]?.problemSection.header.subtitle && (
          <View>
            <Text style={LdStyles.paragraph}>
              {idData.caseStudies[0]?.problemSection.header.subtitle}
            </Text>
          </View>
        )}
        <View style={LdStyles.bulletList}>
          {idData.caseStudies[0]?.problemSection.list.map(
            (idItem, iIdx) => (
              <View style={LdStyles.bulletItem} key={iIdx}>
                <Text style={LdStyles.bulletPoint}>•</Text>
                <Text>{idItem.label}</Text>
              </View>
            )
          )}
        </View>

        {/* CTA */}
        {idData.caseStudies[0]?.ctaSection?.[0] && (
          <View style={LdStyles.ctaSection}>
            <Text style={LdStyles.ctaHeading}>
              {idData.caseStudies[0]?.ctaSection[0]?.header?.title}
            </Text>

            {(() => {
              const Subtitle = idData.caseStudies[0]?.ctaSection[0]?.header?.subtitle || "";
              const Badge = idData.caseStudies[0]?.ctaSection[0]?.header?.badge || "";
              const [before, after] = Subtitle.split("{badge}");

              return (
                <Text style={{ fontSize: 12, color: "#444", marginBottom: 12 }}>
                  {before}
                  <Text style={{ fontWeight: "bold" }}>{Badge}</Text>
                  {after}
                </Text>
              );
            })()}

            <Link src={idData.caseStudies[0]?.ctaSection[0]?.buttons[0]?.href} style={LdStyles.cta}>
              <CalendarIcon />
              <Text style={LdStyles.ctaButtonText}>
                {idData.caseStudies[0]?.ctaSection[0]?.buttons[0]?.label}
              </Text>
            </Link>
          </View>
        )}
      </View>
      {/* Right Column */}
      <View style={LdStyles.rightColumn}>
        {/* objective */}
        <Text style={LdStyles.heading}>OBJECTIVES</Text>
        {idData.caseStudies[0]?.solutionSection.details.map((idItem, iIdx) => (
          <View style={LdStyles.bulletItem} key={iIdx}>
            <Text style={LdStyles.bulletPoint}>•</Text>
            <Text style={LdStyles.paragraph}>{idItem.label}</Text>
          </View>
        ))}

        {/* CTA + Discount Code Section */}
        {idData.caseStudies[0]?.ctaSection?.[1] && (<View
          style={LdStyles.ctaSection}
        >
          <Text
            style={LdStyles.ctaHeading}
          >
            {idData.caseStudies[0]?.ctaSection[1].header?.title}
          </Text>

          <Link
            src={idData.caseStudies[0]?.ctaSection[1].buttons[0]?.href}
            style={LdStyles.cta}
          >
            <CallIcon />
            <Text style={LdStyles.ctaButtonText}>
              {idData.caseStudies[0]?.ctaSection[1].buttons[0]?.label}
            </Text>
          </Link>
        </View>)}

        <View style={LdStyles.divider} />

        {/* result */}
        <Text style={LdStyles.heading}>RESULT AND BENEFITS</Text>
        <View style={LdStyles.bulletList}>
          {idData.caseStudies[0]?.solutionSection.results.map((idItem, iIdx) => (
            <View style={LdStyles.bulletItem} key={iIdx}>
              <Text style={LdStyles.bulletPoint}>•</Text>
              <Text>
                {idItem.title}, {idItem.subtitle}
              </Text>
            </View>
          ))}
        </View>

        {/* cta */}
        {idData.caseStudies[0]?.ctaSection?.[0] && (<View
          style={LdStyles.ctaSection}
        >
          <Text
            style={LdStyles.ctaHeading}
          >
            {idData.caseStudies[0]?.ctaSection[0].title}
          </Text>

          {(() => {
            const Subtitle = idData.caseStudies[0]?.ctaSection[0].header?.subtitle || "";
            const Badge = idData.caseStudies[0]?.ctaSection[0].header?.badge || "";
            const [before, after] = Subtitle.split("{badge}");

            return (
              <Text style={{ fontSize: 12, color: "#444", marginBottom: 12 }}>
                {before}
                <Text style={{ fontWeight: "bold" }}>{Badge}</Text>
                {after}
              </Text>
            );
          })()}


          <Link
            src={idData.caseStudies[0]?.ctaSection[0].buttons[0]?.href}
            style={LdStyles.cta}
          >
            <CalendarIcon />
            <Text style={LdStyles.ctaButtonText}>
              {idData.caseStudies[0]?.ctaSection[0].buttons[0]?.label}
            </Text>
          </Link>
        </View>)}

        <View style={LdStyles.divider} />

        {/* conclusion */}
        <Text style={LdStyles.heading}>CONCLUSION</Text>
        <Text style={LdStyles.paragraph}>{idData.caseStudies[0]?.conclusion?.subtitle}</Text>
      </View>
    </Page>

    {/* page 2 */}
    <Page size="A4" style={LdStyles.page}>
      <View style={LdStyles.leftColumn}>
        {/* contact */}
        <Text style={LdStyles.heading}>CONTACT</Text>
        <View style={LdStyles.contact}>

          <Link src={`tel:${idData.footer.contact.phoneHref}`} style={LdStyles.contactLink}>
            {idData.footer.contact.phoneHref}
          </Link>
          <Link src={idData.footer.contact.address} style={LdStyles.contactLink}>
            {idData.footer.contact.address}
          </Link>
          <Link src={`mailto:${idData.footer.contact.emailHref}`} style={LdStyles.contactLink}>
            {idData.footer.contact.emailHref}
          </Link>
          <Link src={idData.footer.contact.websiteHref} style={LdStyles.contactLink}>
            {idData.footer.contact.websiteHref}
          </Link>

          {/* Social Icons Row */}
          <View style={LdStyles.socialRow}>
            {idData.footer.social.map((idItem, iIndex) => {
              let IconComponent = null;

              switch (idItem.icon) {
                case "Linkedin":
                  IconComponent = <LinkedInIcon />;
                  break;
                case "Youtube":
                  IconComponent = <YouTubeIcon />;
                  break;
                case "Twitter":
                  IconComponent = <TwitterIcon />;
                  break;
              }

              return IconComponent && (
                <Link key={iIndex} src={idItem.href} style={LdStyles.iconLink}>
                  {IconComponent}
                </Link>
              );
            })}
          </View>
        </View>
      </View>

      <View style={LdStyles.rightColumn}>
        {idData.caseStudies[0]?.ctaSection?.[1] && (<View style={LdStyles.ctaSection}>
          <Text style={LdStyles.ctaHeading}>
            {idData.caseStudies[0]?.ctaSection[1].title}
          </Text>

          <Link
            src={idData.caseStudies[0]?.ctaSection[1].buttons[0]?.href}
            style={LdStyles.cta}
          >
            <CallIcon />
            <Text style={LdStyles.ctaButtonText}>
              {idData.caseStudies[0]?.ctaSection[1].buttons[0]?.label}
            </Text>
          </Link>
        </View>)}
      </View>
    </Page>
  </Document>
);
