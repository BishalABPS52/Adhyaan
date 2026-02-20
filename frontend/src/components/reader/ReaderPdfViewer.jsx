"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ReaderPdfViewer.module.css";

export default function ReaderPdfViewer({ pdfUrl, bookTitle }) {
  const [displayUrl, setDisplayUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const objectUrlRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!pdfUrl) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      // Use Google Docs Viewer for mobile devices to avoid blob URL issues in iframes
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
      setDisplayUrl(googleDocsUrl);
      setLoading(false);
      return;
    }

    const prepareDocument = async () => {
      setLoading(true);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      try {
        const response = await fetch(pdfUrl);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(
            new Blob([blob], { type: "application/pdf" }),
          );
          objectUrlRef.current = blobUrl;
          setDisplayUrl(`${blobUrl}#toolbar=1&navpanes=0&view=FitH`);
        } else {
          setDisplayUrl(`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`);
        }
      } catch (err) {
        setDisplayUrl(`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`);
      } finally {
        setLoading(false);
      }
    };

    prepareDocument();
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [pdfUrl]);

  const toggleFullScreen = () => {
    if (!viewerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (viewerRef.current.requestFullscreen) {
          viewerRef.current.requestFullscreen();
        } else if (viewerRef.current.webkitRequestFullscreen) {
          viewerRef.current.webkitRequestFullscreen();
        } else if (viewerRef.current.msRequestFullscreen) {
          viewerRef.current.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen failed:", err);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${bookTitle || "adhyaan_book"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleOrientation = () => {
    setIsLandscape(!isLandscape);
  };

  return (
    <div className={styles.readerWrapper} ref={viewerRef}>
      <div className={styles.readerToolbar}>
        <div className={styles.readerInfo}>
          <h3>{bookTitle || "Reading Material"}</h3>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.controlBtn}
            onClick={toggleOrientation}
            title="Toggle View Mode"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {isLandscape ? "Portrait" : "Landscape"}
          </button>

          <button
            className={styles.controlBtn}
            onClick={handleDownload}
            title="Download Book"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>

          <button
            className={styles.controlBtn}
            onClick={toggleFullScreen}
            title="Fullscreen Focus Mode"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Full Screen
          </button>
        </div>
      </div>

      <div
        className={`${styles.readerFrame} ${isLandscape ? styles.landscape : ""}`}
      >
        {loading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Immersive reading mode starting...</p>
          </div>
        )}
        {displayUrl && (
          <iframe
            src={displayUrl}
            className={styles.iframe}
            title={bookTitle}
            onLoad={() => setLoading(false)}
            allow="fullscreen"
          />
        )}
      </div>
    </div>
  );
}
