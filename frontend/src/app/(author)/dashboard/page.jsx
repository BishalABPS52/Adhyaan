"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/services/api";
import { useTheme } from "@/hooks/useTheme";
import styles from "./page.module.css";
import BookUploadForm from "@/components/author/BookUploadForm";

export default function AuthorDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await apiService.get("/author/dashboard/stats");
      setStats(data);
      setBooks(data.recent_books || []);
      setTopBooks(data.top_rated_books || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await apiService.delete(`/author/${bookId}`);
      setBooks(books.filter((book) => book.id !== bookId));
      setTopBooks(topBooks.filter((book) => book.id !== bookId));
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${isDark ? styles.dark : styles.light}`}
    >
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <p className={styles.pageSubtitle}>
            Manage your content and track performance
          </p>
          <button
            className={styles.uploadBtn}
            onClick={() => setShowUploadForm(true)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload New Book
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats?.total_books || 0}</div>
            <div className={styles.statLabel}>Books</div>
            <div className={styles.statSublabel}>Total Books</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats?.total_readers || 0}</div>
            <div className={styles.statLabel}>Readers</div>
            <div className={styles.statSublabel}>Total Readers</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {stats?.average_rating ? stats.average_rating.toFixed(1) : "0.0"}
            </div>
            <div className={styles.statLabel}>Rating</div>
            <div className={styles.statSublabel}>Average Rating</div>
          </div>
        </div>
      </div>

      {/* Upload Content Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Upload Content</h2>
        <div className={styles.uploadGrid}>
          <div
            className={styles.uploadCard}
            onClick={() => setShowUploadForm(true)}
          >
            <div className={styles.uploadIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <div className={styles.uploadCardTitle}>Books</div>
              <div className={styles.uploadCardSubtitle}>Books</div>
              <p className={styles.uploadCardDesc}>
                Upload indie books, academic books, or research papers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* My Books Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>My Books</h2>
        {!books || books.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className={styles.emptyStateTitle}>No Books</h3>
            <p className={styles.emptyStateText}>
              You haven't uploaded any books yet.
            </p>
            <button
              className={styles.uploadBtn}
              onClick={() => setShowUploadForm(true)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Your First Book
            </button>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map((book) => (
              <div key={book.id} className={styles.bookCard}>
                <div className={styles.bookCover}>
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} />
                  ) : (
                    <div className={styles.placeholderCover}>
                      {book.book_type === "indie" ? "Indie" : "Academic"}
                    </div>
                  )}
                </div>
                <div className={styles.bookInfo}>
                  <h3>{book.title}</h3>
                  <div className={styles.bookMeta}>
                    <span>
                      ⭐ {book.rating ? book.rating.toFixed(1) : "0.0"}
                    </span>
                    <span>{book.total_readers || 0} readers</span>
                  </div>
                  <div className={styles.bookType}>
                    {book.book_type === "indie" ? "Indie" : "Academic"}
                  </div>
                  <div className={styles.bookActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() =>
                        router.push(`/author/edit-book/${book.id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          <div
            className={styles.actionCard}
            onClick={() => setShowUploadForm(true)}
          >
            <div className={styles.actionIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <div className={styles.actionCardTitle}>Upload</div>
              <p className={styles.actionCardSubtitle}>Upload New Book</p>
            </div>
          </div>

          <Link href="/author/analytics" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <div className={styles.actionCardTitle}>Analytics</div>
              <p className={styles.actionCardSubtitle}>View Analytics</p>
            </div>
          </Link>

          <Link href="/author/profile" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <div className={styles.actionCardTitle}>Profile</div>
              <p className={styles.actionCardSubtitle}>Manage Profile</p>
            </div>
          </Link>
        </div>
      </div>

      {showUploadForm && (
        <BookUploadForm
          onClose={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
