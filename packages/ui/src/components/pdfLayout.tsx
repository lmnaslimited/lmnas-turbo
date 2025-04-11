// // pdf/PdfLayout.tsx
// import React from 'react';

// type PdfLayoutProps = {
//   title: string;
//   content: string;
// };

// const PdfLayout = ({ title, content }: PdfLayoutProps) => {
//   return (
//     <div
//       id="pdf-content"
//       className="w-full p-8 bg-white text-black"
//       style={{ width: '800px' }}
//     >
//       <h1 className="text-3xl font-bold mb-4">{title}</h1>
//       <p className="text-lg leading-relaxed">{content}</p>
//     </div>
//   );
// };

// export default PdfLayout;


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
    text: string;
    subtitle: string;
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
        <Text style={styles.textWithoutColor}>{data.heading.textWithoutColor}</Text>
        <Text style={styles.text}>{data.heading.text}</Text>
        <Text style={styles.subtitle}>{data.heading.subtitle}</Text>
      </View>
      <Image src={data.image.src} style={styles.image} />
    </Page>
  </Document>
);