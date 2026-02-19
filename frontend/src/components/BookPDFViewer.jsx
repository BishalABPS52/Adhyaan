'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './BookPDFViewer.module.css';

/**
 * Universal Book PDF/DOCX Viewer
 * Bypasses high-level forced downloads by fetching documents as blobs.
 */
export default function BookPDFViewer({ pdfUrl, bookTitle }) {
  const [displayUrl, setDisplayUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const objectUrlRef = useRef(null);

  const isDocx = pdfUrl?.toLowerCase().endsWith('.docx') || pdfUrl?.toLowerCase().endsWith('.doc');

  useEffect(() => {
    if (!pdfUrl) return;

    const prepareDocument = async () => {
      setLoading(true);
      setError('');

      // Cleanup previous URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      if (isDocx) {
        // DOCX still requires Google Viewer for embedding, as browser can't render it natively
        setDisplayUrl(`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`);
        setLoading(false);
        return;
      }

      try {
        // Fetch the PDF as a blob to bypass Content-Disposition: attachment headers
        const response = await fetch(pdfUrl);
        if (response.ok) {
          const blob = await response.blob();
          // Create a local URL for the blob
          const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          objectUrlRef.current = blobUrl;
          setDisplayUrl(`${blobUrl}#toolbar=1&navpanes=0&view=FitH`);
        } else {
          setDisplayUrl(`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`);
        }
      } catch (err) {
        // Fallback to direct URL if fetch fails (e.g., CORS)
        setDisplayUrl(`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`);
      } finally {
        setLoading(false);
      }
    };

    prepareDocument();

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [pdfUrl, isDocx]);

  if (!pdfUrl) {
    return (
      <div className={styles.errorBox}>
        <p>No document source selected.</p>
      </div>
    );
  }

  return (
    <div className={styles.viewerWrapper}>
      {loading && (
        <div className={styles.viewerLoader}>
          <div className={styles.spinner}></div>
          <p>Analyzing document...</p>
        </div>
      )}

      {displayUrl && (
        <iframe
          src={displayUrl}
          className={styles.iframe}
          title={bookTitle || 'Reader'}
          onLoad={() => setLoading(false)}
          allow="fullscreen"
        />
      )}
    </div>
  );
}
