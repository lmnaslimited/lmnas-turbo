"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Link,
} from "@react-pdf/renderer";
import { TcaseStudies } from "@repo/middleware/types";

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

//To Support SVG in react-pdf/renderer
//use <Svg/> and <Path/> 
//Component name should start with capital
const CalendarIcon = () => (
  <Svg viewBox="0 0 24 24" style={LdStyles.icon}>
    <Path
      fill="white"
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 
      .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 
      2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"
    />
  </Svg>
);

const CallIcon = () => (
  <Svg viewBox="0 0 24 24" style={LdStyles.icon}>
    <Path
      fill="white" // Tailwind blue-600
      d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 
         1 0 011.05-.24 11.36 11.36 0 003.55.57 1 
         1 0 011 1V20a1 1 0 01-1 1A16 16 0 014 
         5a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 
         00.57 3.55 1 1 0 01-.24 1.05l-2.21 2.19z"
    />
  </Svg>
);

const LinkedInIcon = () => (
  <Svg viewBox="0 0 24 24" width="16" height="16">
    <Path
      fill="#2563EB"
      d="M19 0h-14C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 
         0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM7.1 20.5H3.6V9h3.5v11.5zM5.4 
         7.4c-1.1 0-1.9-.9-1.9-2s.9-2 1.9-2c1.1 0 1.9.9 
         1.9 2s-.8 2-1.9 2zm15.1 13.1h-3.5v-5.6c0-1.3-.5-2.2-1.6-2.2-1 
         0-1.5.7-1.8 1.3-.1.3-.1.7-.1 1.1v5.4h-3.5V9h3.4v1.6c.5-.8 
         1.3-1.6 3-1.6 2.2 0 3.8 1.5 3.8 4.6v6.9z"
    />
  </Svg>
);

const YouTubeIcon = () => (
  <Svg viewBox="0 0 24 24" width="16" height="16">
    <Path
      fill="#FF0000"
      d="M23.5 6.2c-.3-1.2-1.2-2.1-2.4-2.4C18.8 
         3.3 12 3.3 12 3.3s-6.8 0-9.1.5c-1.2.3-2.1 1.2-2.4 
         2.4C0 8.5 0 12 0 12s0 3.5.5 5.8c.3 1.2 1.2 2.1 2.4 
         2.4 2.3.5 9.1.5 9.1.5s6.8 0 9.1-.5c1.2-.3 2.1-1.2 
         2.4-2.4.5-2.3.5-5.8.5-5.8s0-3.5-.5-5.8zM9.5 15.5V8.5l6 
         3.5-6 3.5z"
    />
  </Svg>
);

const TwitterIcon = () => (
  <Svg viewBox="0 0 24 24" width="16" height="16">
    <Path
      fill="#1DA1F2"
      d="M24 4.6c-.9.4-1.8.6-2.8.8 1-.6 1.7-1.5 
         2.1-2.6-.9.5-2 .9-3.1 1.1-1-1-2.4-1.6-3.9-1.6-3 
         0-5.4 2.5-5.4 5.5 0 .4 0 .8.1 1.1-4.5-.2-8.4-2.4-11-5.7-.5.9-.8 
         1.9-.8 3 0 1.9 1 3.5 2.4 4.5-.8 0-1.6-.3-2.3-.7v.1c0 
         2.7 1.9 5 4.4 5.5-.5.2-1.1.2-1.7.2-.4 0-.8 
         0-1.2-.1.8 2.5 3.1 4.2 5.9 4.2-2.1 1.7-4.7 
         2.7-7.5 2.7-.5 0-1 0-1.5-.1C2.7 21.5 5.9 22.5 
         9.3 22.5c11.2 0 17.3-9.3 17.3-17.3v-.8c1.2-.9 
         2-1.7 2.8-2.8z"
    />
  </Svg>
);

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
