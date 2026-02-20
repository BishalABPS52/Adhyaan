'use client';

import React from "react";
import Link from "next/link";
import styles from "./BookCard.module.css";
import Avatar from "@/components/ui/Avatar";

const BookCard = ({ book, formatGenre, onClick }) => {
  const formatGenreFunc = formatGenre || ((genre) => genre);

  // Handle field name differences between backend and expected format
  const title = book.book_name || book.title || "Untitled";
  const bookType = book.book_type || (book.board ? "academic" : "indie");
  const subject = book.subject_name || book.subject;
  const courseName = book.course_name || book.class;

  // Determine if it's indie or academic based on available fields
  const isAcademic = !!book.board || !!book.course_name || !!book.subject_name;
  const displayType = isAcademic ? "academic" : "indie";

  return (
    <div
      className={`${styles.bookCard} ${displayType === "academic" ? styles.academic : styles.indie}`}
    >
      <div className={styles.bookCover}>
        {book.cover_image_url ? (
          <img src={book.cover_image_url} alt={title} />
        ) : (
          <div className={styles.placeholderCover}>
            {displayType === "indie" ? "Indie" : "Academic"}
          </div>
        )}
        <div className={styles.bookBadge}>
          {displayType === "indie" ? "Indie" : "Featured"}
        </div>
      </div>
      <div className={styles.bookCardContent}>
        <h3>{title}</h3>

        {/* Show author and genre for indie books */}
        {displayType === "indie" && (
          <>
            <p className={styles.author}>
              by {book.author_name || "Anonymous"}
            </p>
            {book.genre && (
              <div className={styles.genreWrapper}>
                <span className={styles.genre}>
                  Genre: {formatGenreFunc(book.genre)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Show subject for academic books */}
        {displayType === "academic" && (
          <>
            {subject && (
              <div className={styles.genreWrapper}>
                <span className={styles.subject}>Subject: {subject}</span>
              </div>
            )}
            {(book.board || courseName) && (
              <p className={styles.level}>
                {book.board} {courseName || ""}
              </p>
            )}
            <p className={styles.provider}>
              Provider: {book.document_provider || "Anonymous"}
            </p>
          </>
        )}

        <div className={styles.bookMeta}>
          <span className={styles.ratingStars}>
            ⭐ {book.rating > 0 ? Number(book.rating).toFixed(1) : "0.0"}
          </span>
          {(!book.rating || book.rating === 0) && (
            <span className={styles.notRated}>Not yet rated</span>
          )}
        </div>

        {onClick ? (
          <button
            className={styles.readButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick();
            }}
          >
            Read Now
          </button>
        ) : (
          <Link href={`/reader/${book.id}`} className={styles.readButton}>
            Read Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default BookCard;
