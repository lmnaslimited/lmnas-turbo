import { StyleSheet, Svg, Path } from "@react-pdf/renderer";

// styles used in detailed-casestudy-layout
export const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  
  logoWrapper: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  
  logo: {
    width: 28,
    height: 28,
    objectFit: "contain",
  },
  
  brandText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0a2e57",
    lineHeight: 1,
    marginLeft: 8,
  },
  header: {
    height: 60,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  
  headerAccent: {
    height: 6,
    backgroundColor: "#0f4c81",
    width: "100%",
  },
  
  headerCircle: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0f4c81",
    opacity: 0.15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a2e57",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },

  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 8,
  },

  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#0f4c81",
  },
  
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d0d7e2",
  },
  
  tableBodyRow: {
    flexDirection: "row",
  },
  
  tableCell: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d0d7e2",
  },
  cellTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cellText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  ctaBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f2f6ff",
    borderLeftWidth: 3,
    borderLeftColor: "#0f4c81",
  },
  
  ctaText: {
    fontSize: 11,
    marginBottom: 10,
    color: "#333",
    lineHeight: 1.4,
  },
  
  ctaButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#0f4c81",
    borderRadius: 4,
    textDecoration: "none",
  },
  
  ctaButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  icon: {
    width: 14,
    height: 14,
    margin: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  
  iconBox: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  
  contactText: {
    fontSize: 11,
    lineHeight: 1.4,
    textDecoration: "none",
    color: "#0f4c81",
  },
})

// svg used in pdf
export const PhoneIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path
      fill="#000"
      d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.3c1.2.4 2.5.6 3.8.6a1 1 0 011 1V20a1 1 0 01-1 1C10.6 21 3 13.4 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.3.2 2.6.6 3.8a1 1 0 01-.3 1l-2.2 2z"
    />
  </Svg>
)

export const MailIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path
      fill="#000"
      d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5L4 8V6l8 5 8-5v2z"
    />
  </Svg>
);

export const LocationIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path
      fill="#000"
      d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"
    />
  </Svg>
);


export const GlobeIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path
      fill="#000"
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.9 9h-3.2a15.7 15.7 0 00-1.4-6A8 8 0 0119.9 11zM12 4c1.1 1.5 2 3.8 2.4 7H9.6C10 7.8 10.9 5.5 12 4zM4.1 13H7.3c.2 2.2.7 4.2 1.4 6A8 8 0 014.1 13zm3.2-2H4.1A8 8 0 018.7 5c-.7 1.8-1.2 3.8-1.4 6zM12 20c-1.1-1.5-2-3.8-2.4-7h4.8C14 16.2 13.1 18.5 12 20zm3.3-.9c.7-1.8 1.2-3.8 1.4-6h3.2a8 8 0 01-4.6 6z"
    />
  </Svg>
);

export const CallIcon = () => (
  <Svg viewBox="0 0 24 24" style={styles.icon}>
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

export const LinkedInIcon = () => (
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

export const YouTubeIcon = () => (
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

export const TwitterIcon = () => (
  <Svg viewBox="0 0 24 24" width="16" height="16">
    <Path
      fill="#000000"
      d="M18.9 2H22l-6.8 7.8L23 22h-6.8l-5.3-6.6L4.8 22H2l7.3-8.4L1 2h6.9l4.8 6.1L18.9 2zm-1.2 18h1.7L6.1 3.9H4.3L17.7 20z"
    />
  </Svg>
);

export const CalendarIcon = () => (
    <Svg viewBox="0 0 24 24" style={styles.icon}>
      <Path
        fill="white"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 
        .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 
        2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"
      />
    </Svg>
  );