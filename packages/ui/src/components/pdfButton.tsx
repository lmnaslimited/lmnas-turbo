// 'use client';

// import React from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import PdfLayout from '@repo/ui/components/pdfLayout'

// type Props = {
//   title: string;
//   content: string;
// };

// const PdfButton = ({ title, content }: Props) => {
//   const handleDownload = async () => {
//     const input = document.getElementById('pdf-content');
//     if (!input) return;
//     const html2canvasCallable = html2canvas as unknown as (element: HTMLElement) => Promise<HTMLCanvasElement>;

//     const canvas = await html2canvasCallable(input); // no error now
//     const imgData = canvas.toDataURL('image/png');

//     const pdf = new jsPDF({
//       orientation: 'portrait',
//       unit: 'pt',
//       format: 'a4',
//     });

//     const width = pdf.internal.pageSize.getWidth();
//     const height = (canvas.height * width) / canvas.width;

//     pdf.addImage(imgData, 'PNG', 0, 0, width, height);
//     pdf.save(`${title}.pdf`);
//   };

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <PdfLayout title={title} content={content} />
//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         onClick={handleDownload}
//       >
//         Download PDF
//       </button>
//     </div>
//   );
// };

// export default PdfButton;

'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PdfDocument } from '@repo/ui/components/pdfLayout';
import { Button } from "@repo/ui/components/ui/button";

type Props = {
  title: string;
  content: string;
};

export const PdfButton = ({ title, content }: Props) => (
  <PDFDownloadLink
    document={<PdfDocument title={title} content={content} />}
    fileName="dynamic-content.pdf"
    style={{ textDecoration: 'none' }}
  >
    {({ loading }) =>
      loading ? (
        <Button disabled>Loading PDF...</Button>
      ) : (
        <Button>Download PDF</Button>
      )
    }
  </PDFDownloadLink>
);

export default PdfButton; 