import { useEffect, useState, useRef } from "react";

const PdfViewer = ({ filename }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const urlRef = useRef(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`/api/view-pdf/${filename}`);
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Clean up previous URL if it exists
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
        }

        urlRef.current = url;
        setPdfUrl(url);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPdf();

    // Cleanup function to revoke the object URL when component unmounts or filename changes
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [filename]);

  if (!pdfUrl) {
    return <p>Loading PDF...</p>;
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      background: '#f8f8f8', 
      borderRadius: '12px', 
      overflow: 'hidden', 
      border: '1px solid #e0e0e0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <object
        data={`${pdfUrl}#toolbar=0&navpanes=0`}
        type="application/pdf"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      >
        <embed
          src={`${pdfUrl}#toolbar=0&navpanes=0`}
          type="application/pdf"
          width="100%"
          height="100%"
        />
      </object>
    </div>
  );
};

export default PdfViewer;