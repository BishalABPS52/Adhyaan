"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import BookCard from "@/components/book/BookCard";
import { formatGenre } from "@/utils/formatGenre";
import { getApiBaseUrl } from "@/services/api";
import styles from "./page.module.css";

export default function StudentHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [indieBooks, setIndieBooks] = useState([]);
  const [academicBooks, setAcademicBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      // Fetch indie and academic books separately to avoid duplicates
      const [indieResponse, academicResponse] = await Promise.all([
        fetch(`${baseUrl}/books/indie?limit=6`),
        fetch(`${baseUrl}/books/academic?limit=6`),
      ]);

      if (indieResponse.ok) {
        const indieData = await indieResponse.json();
        setIndieBooks(indieData.books || []);
      }

      if (academicResponse.ok) {
        const academicData = await academicResponse.json();
        setAcademicBooks(academicData.books || []);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (e, book) => {
    e.preventDefault();
    e.stopPropagation();
    if (book?.file_url) {
      const link = document.createElement("a");
      link.href = book.file_url;
      link.download = `${book.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRandomPick = () => {
    if (indieBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * indieBooks.length);
      const randomBook = indieBooks[randomIndex];
      router.push(`/reader/${randomBook.id}`);
    }
  };

  const [continueReading, setContinueReading] = useState([]);

  useEffect(() => {
    fetchContinueReading();
  }, []);

  const fetchContinueReading = async () => {
    const baseUrl = getApiBaseUrl();
    const token =
      localStorage.getItem("adhyaan_token") || localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${baseUrl}/books/continue-reading?limit=3`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setContinueReading(data.books || []);
      }
    } catch (error) {
      console.error("Error fetching continue reading:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>Namaste, {user?.name || user?.full_name || "Student"}!</h1>
            <p className={styles.subtitle}>Continue your learning journey</p>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <section className={styles.section}>
          <h2>Explore Sections</h2>
          <div className={styles.mainCardsGrid}>
            <Link href="/reader" className={styles.mainCardLink}>
              <Card className={styles.mainCard} hover>
                <div
                  className={styles.mainCardIcon}
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className={styles.mainCardContent}>
                  <h3>Reader's Section</h3>
                  <p>
                    Reader's section explore indie books, novels or reader
                    section
                  </p>
                  <div className={styles.mainCardArrow}>→</div>
                </div>
              </Card>
            </Link>

            <Link href="/student" className={styles.mainCardLink}>
              <Card className={styles.mainCard} hover>
                <div
                  className={styles.mainCardIcon}
                  style={{
                    background:
                      "linear-gradient(135deg, #1F5FA8 0%, #3B82F6 100%)",
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className={styles.mainCardContent}>
                  <h3>Student Section</h3>
                  <p>
                    Explore academic books based on board, course and curriculum
                  </p>
                  <div className={styles.mainCardArrow}>→</div>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Continue Reading Section */}
        {continueReading.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Continue Reading</h2>
              <Link href="/reader">
                <Button variant="secondary" size="small">
                  View All
                </Button>
              </Link>
            </div>
            <div className={styles.booksGrid}>
              {continueReading.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Indie Books */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Popular in Indie Books</h2>
              <Link href="/search/reader">
                <Button variant="secondary" size="small">
                  Explore More
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading books...</p>
            ) : indieBooks.length === 0 ? (
              <p>No indie books available yet.</p>
            ) : (
              <div className={styles.booksGrid}>
                {indieBooks.map((book, index) => (
                  <BookCard
                    key={book.id || `indie-book-${index}`}
                    book={book}
                    formatGenre={formatGenre}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Popular Academic Books */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Popular in Academic</h2>
              <Link href="/search/student">
                <Button variant="secondary" size="small">
                  Browse Academic
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading books...</p>
            ) : academicBooks.length === 0 ? (
              <p>No academic books available yet.</p>
            ) : (
              <div className={styles.booksGrid}>
                {academicBooks.map((book, index) => (
                  <BookCard
                    key={book.id || `academic-book-${index}`}
                    book={book}
                    formatGenre={formatGenre}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.section}>
          <h2>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Card className={styles.actionCard} hover>
              <div
                className={styles.actionIcon}
                style={{ background: "#EEF2FF", color: "#4F46E5" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3 1.912 5.886H20.09L15.11 12.53l1.912 5.886L12 14.77l-5.022 3.645 1.912-5.886L3.91 8.886h6.178L12 3z" />
                </svg>
              </div>
              <h3>Browse Genres</h3>
              <p>Explore stories by category</p>
              <Link href="/reader">
                <Button variant="secondary" size="small">
                  Explore Now
                </Button>
              </Link>
            </Card>

            <Card className={styles.actionCard} hover>
              <div
                className={styles.actionIcon}
                style={{ background: "#ECFDF5", color: "#10B981" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <h3>Study Materials</h3>
              <p>Textbooks and course guides</p>
              <Link href="/student">
                <Button variant="secondary" size="small">
                  Browse All
                </Button>
              </Link>
            </Card>

            <Card className={styles.actionCard} hover>
              <div
                className={styles.actionIcon}
                style={{ background: "#FFF7ED", color: "#F97316" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>Random Pick</h3>
              <p>Let luck choose your next read</p>
              <Button
                variant="secondary"
                size="small"
                onClick={handleRandomPick}
                disabled={loading || indieBooks.length === 0}
              >
                Surprise Me
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
