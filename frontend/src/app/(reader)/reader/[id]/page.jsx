"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { StudentPdfViewer } from "@/components/student";
import { ReaderPdfViewer } from "@/components/reader";
import { getApiBaseUrl } from "@/services/api";
import Avatar from "@/components/ui/Avatar";

/**
 * Premium Reading Page with Dual UI Modes:
 * 1. General Reader View (Indie/Novels)
 * 2. Academic Student View (Structure & Metadata)
 *
 * Moved to (reader) group to fulfill route requirements while keeping the latest UI.
 */
export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReader, setShowReader] = useState(false);
  const [isMarkedRead, setIsMarkedRead] = useState(false);
  const [confirmMarkRead, setConfirmMarkRead] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const readerRef = useRef(null);

  useEffect(() => {
    if (bookId) fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const token =
        localStorage.getItem("adhyaan_token") || localStorage.getItem("token");
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch book details");
      }

      const data = await response.json();
      setBook(data);
      setIsMarkedRead(data.user_is_completed || false);
      if (data.user_rating > 0) {
        setUserRating(data.user_rating);
        setHasRated(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleReadNow = () => {
    setShowReader(true);
    // Smooth scroll to reader
    setTimeout(() => {
      readerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const getRatingMessage = (rating) => {
    if (rating === 0) return "Select a star to rate";

    if (isAcademic) {
      const academicMessages = {
        1: "⭐⭐ 1 — Not Helpful: Confusing or irrelevant; adds little value.",
        2: "⭐⭐ 2 — Slightly Helpful: Some useful info, but incomplete or unclear.",
        3: "⭐⭐⭐ 3 — Helpful: Clear and informative; covers the basics well.",
        4: "⭐⭐⭐⭐ 4 — Very Helpful: Well-organized, insightful, and easy to follow.",
        5: "⭐⭐⭐⭐⭐ 5 — Extremely Helpful: Thorough, highly informative, and essential for understanding.",
      };
      return academicMessages[rating];
    } else {
      const indieMessages = {
        1: "⭐ 1 — Not Enjoyable: Difficult to engage with or not satisfying.",
        2: "⭐⭐ 2 — Below Expectations: Some interesting parts, but overall weak execution.",
        3: "⭐⭐⭐ 3 — Enjoyable: A decent and readable story.",
        4: "⭐⭐⭐⭐ 4 — Highly Enjoyable: Engaging, well-written, and memorable.",
        5: "⭐⭐⭐⭐⭐ 5 — Outstanding Read: Captivating, immersive, and hard to put down.",
      };
      return indieMessages[rating];
    }
  };

  const handleConfirmRating = async () => {
    const baseUrl = getApiBaseUrl();
    const token =
      localStorage.getItem("adhyaan_token") || localStorage.getItem("token");

    if (!token) {
      alert("Please login to rate materials");
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/books/${bookId}/rate?rating=${userRating}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setHasRated(true);
        fetchBookDetails(); // Refresh book data to show new average
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Network error while submitting rating");
    }
  };

  const handleMarkAsRead = async () => {
    if (!confirmMarkRead) return;

    const baseUrl = getApiBaseUrl();
    const token =
      localStorage.getItem("adhyaan_token") || localStorage.getItem("token");

    if (!token) {
      alert("Please login to mark materials as read");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/books/${bookId}/mark-as-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsMarkedRead(true);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      alert("Network error while marking as read");
    }
  };

  const getFileUrl = (book) => {
    if (!book) return "";
    let url = book.file_url || book.file_path;
    if (!url) return "";

    url = url.trim();
    if (url.includes("vercel-storage.com") && !url.startsWith("http")) {
      url = `https://${url}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Preparing your reading environment...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>📄</div>
        <h2>Material Missing</h2>
        <p>{error || "Requested document could not be found."}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  const isAcademic = book.book_type === "academic" || !!book.board;
  const fileUrl = getFileUrl(book);
  const title = book.book_name || book.title || "Untitled Material";
  const author = book.author_name || book.uploaded_by_name || "Verified Author";
  const description =
    book.description || "No detailed description available for this material.";

  const renderIndieView = () => (
    <div className={styles.indieView}>
      <div className={styles.indieHeader}>
        <h1 className={styles.indieTitle}>{title}</h1>
        <div className={styles.indieMeta}>
          <p className={styles.indieAuthor}>
            By {book.author_name || "Anonymous"}
          </p>
          <div className={styles.uploaderInfo}>
            <Avatar
              name={book.uploaded_by_name}
              src={book.uploader_profile_image}
              size="small"
            />
            <span>Uploaded by: {book.uploaded_by_name || "Anonymous"}</span>
          </div>
        </div>
      </div>

      <div className={styles.indieDescription}>
        <p>{description}</p>
        <div className={styles.descriptionBadges}>
          <div className={styles.miniViewBadge}>Indie Book</div>
          <div className={styles.descriptionReaderCount}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {book.reader_count || 0} Readers
          </div>
        </div>
      </div>

      {!showReader && (
        <div className={styles.actionCenter}>
          <button className={styles.readNowBtn} onClick={handleReadNow}>
            {isMarkedRead ? "Read Again" : "Read Now"}
          </button>
        </div>
      )}
    </div>
  );

  /**
   * UI 2: Student Academic View
   */
  const renderAcademicView = () => (
    <div className={styles.academicView}>
      <div className={styles.academicMetadataGrid}>
        <div className={styles.metadataCard}>
          <label>BOARD</label>
          <span>{book.board || "Others"}</span>
        </div>
        <div className={styles.metadataCard}>
          <label>COURSE</label>
          <span>{book.course_name || "General"}</span>
        </div>
        <div className={styles.metadataCard}>
          <label>SUBJECT</label>
          <span>{book.subject_name || book.subject || "Core Subject"}</span>
        </div>
        <div className={styles.metadataCard}>
          <label>ACADEMIC YEAR</label>
          <span>
            Year {book.year || "N/A"}
            {book.part ? ` • Part ${book.part}` : ""}
            {book.semester ? ` • Sem ${book.semester}` : ""}
            {!book.part && !book.semester ? " • Full Term" : ""}
          </span>
        </div>
        <div className={styles.metadataCard}>
          <label>PROVIDER/CREATOR</label>
          <span>{book.document_provider || "Anonymous"}</span>
        </div>
      </div>

      <div className={styles.academicInfo}>
        <h1 className={styles.academicTitle}>{title}</h1>
        {book.chapter_name && (
          <div className={styles.chapterTag}>
            {book.chapter_number ? `Chapter ${book.chapter_number}: ` : ""}
            {book.chapter_name}
          </div>
        )}

        <div className={styles.academicUploader}>
          <Avatar name={book.uploaded_by_name} size="xsmall" />
          <span>Uploaded by: {book.uploaded_by_name || "Anonymous"}</span>
        </div>

        <div className={styles.descriptionText}>
          {description}
          <div className={styles.descriptionBadges}>
            <div className={styles.miniViewBadge}>Academic Content</div>
            <div className={styles.descriptionReaderCount}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {book.reader_count || 0} Readers
            </div>
          </div>
        </div>
      </div>

      {!showReader && (
        <div className={styles.academicAction}>
          <button className={styles.readNowBtn} onClick={handleReadNow}>
            {isMarkedRead ? "Study Again" : "Start Studying"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.pageRoot}>
      {/* Universal Header (Now minimal) */}
      <header className={styles.topHeader}>
        <div className={styles.headerSpacer}></div>
      </header>

      <main className={styles.contentContainer}>
        {/* Render View Based on Book Type */}
        {isAcademic ? renderAcademicView() : renderIndieView()}

        {/* Embedded Viewer (Revealed on 'Read Now') */}
        {showReader && (
          <div className={styles.readerSection} ref={readerRef}>
            {isAcademic ? (
              <StudentPdfViewer pdfUrl={fileUrl} bookTitle={title} />
            ) : (
              <ReaderPdfViewer pdfUrl={fileUrl} bookTitle={title} />
            )}
          </div>
        )}

        {/* Mark as Read — shown when reader is open */}
        {showReader && !isMarkedRead && (
          <div className={styles.markReadSection}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={confirmMarkRead}
                onChange={(e) => setConfirmMarkRead(e.target.checked)}
              />
              <span className={styles.checkmark}></span>
              {isAcademic
                ? "I have finished studying this"
                : "I have completed reading this"}
            </label>
            <button
              className={styles.markReadBtn}
              onClick={handleMarkAsRead}
              disabled={!confirmMarkRead}
            >
              Mark as Read
            </button>
          </div>
        )}

        {showReader && isMarkedRead && (
          <div className={styles.completedBadge}>You have completed this!</div>
        )}

        {/* Ratings Section */}
        {showReader && (
          <div className={styles.ratingSection}>
            <div className={styles.ratingDivider}></div>
            <div className={styles.ratingHeader}>
              <div className={styles.avgContainer}>
                <span className={styles.avgLabel}>Avg. Rating:</span>
                {book.review_count > 0 ? (
                  <>
                    <span className={styles.avgValue}>
                      {Number(book.rating).toFixed(1)}
                    </span>
                    <div className={styles.avgStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          style={{
                            color:
                              s <= Math.round(book.rating)
                                ? "#fbbf24"
                                : "#e2e8f0",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <span className={styles.notRatedLabel}>Not yet rated</span>
                )}
              </div>
              <h3>Rate this</h3>
            </div>

            {hasRated ? (
              <div className={styles.thanksWrap}>
                <div className={styles.thanksMsg}>
                  You rated this: {userRating} ★
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    marginTop: "5px",
                  }}
                >
                  Thanks for your feedback!
                </div>
              </div>
            ) : (
              <>
                <div className={styles.starPicker}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`${styles.starBtn} ${userRating >= star ? styles.starBtnActive : ""}`}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className={styles.ratingMessage}>
                  {getRatingMessage(hoverRating || userRating)}
                </div>

                <button
                  className={styles.confirmRatingBtn}
                  onClick={handleConfirmRating}
                  disabled={userRating === 0}
                >
                  Confirm Rating
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
