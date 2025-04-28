'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  headingSection: {
    marginBottom: 20,
  },
  textWithoutColor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0070f3', // LMNAs branding color
  },
  subtitle: {
    fontSize: 12,
    marginTop: 10,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 20,
    objectFit: 'cover',
  },
});

type PdfProps = {
  heading: {
    textWithoutColor: string;
    title: string;
    highlight: string;
  };
  image: {
    src: string;
    alt?: string;
  };
};

export const PdfDocument = ({ data }: {data:PdfProps}) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.headingSection}>
        <Text style={styles.textWithoutColor}>{data.heading.title}</Text>
        <Text style={styles.text}>{data.heading.highlight}</Text>
        <Text style={styles.subtitle}>{data.heading.highlight}</Text>
      </View>
      {/* <Image src={data.image?.source} style={styles.image} /> */}
    </Page>
  </Document>
);