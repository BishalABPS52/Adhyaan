"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";
import { apiService } from "@/services/api";
import BookCard from "@/components/book/BookCard";

export default function HomePage() {
  const { user } = useAuth();
  const { role } = useRole();
  const router = useRouter();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [featuredAuthors, setFeaturedAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect logged-in users to their role-specific home
  useEffect(() => {
    if (user) {
      if (role === "author") {
        router.push("/dashb");
      } else {
        router.push("/home");
      }
    }
  }, [user, role, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, authorsData] = await Promise.all([
          apiService.get("/books/?limit=6"),
          apiService.get("/users/featured-authors?limit=3"),
        ]);
        setFeaturedBooks(booksData.books || []);
        setFeaturedAuthors(authorsData.authors || []);
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAnyClick = () => {
    router.push("/auth/login");
  };

  const bookColors = ["#1F5FA8", "#F4C430", "#10B981", "#8B5CF6"];
  const authorColors = ["#EF4444", "#3B82F6", "#F59E0B"];

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={`${styles.heroTitle} ${styles.fadeInUp}`}>
              Welcome to <span className={styles.brandText}>Adhyaan</span>
            </h1>
            <p
              className={`${styles.heroTagline} ${styles.fadeInUp} ${styles.delay1}`}
            >
              Your Digital Learning Companion – Study & Learn
            </p>
            <p
              className={`${styles.heroDescription} ${styles.fadeInUp} ${styles.delay2}`}
            >
              Access multiple indie books, structured courses, and publish your
              own study materials.
            </p>
          </div>

          {/* Three CTA Cards */}
          <div className={styles.ctaCards}>
            <Card hover className={styles.ctaCard} onClick={handleAnyClick}>
              <div className={styles.ctaIcon}>
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h2>Explore as Student / Reader</h2>
              <p>
                Browse categorized indie & academic books and learn at your own
                pace.
              </p>
              <Button
                variant="primary"
                size="large"
                style={{ marginTop: "1rem" }}
              >
                Open Library
              </Button>
            </Card>

            <Card hover className={styles.ctaCard} onClick={handleAnyClick}>
              <div className={styles.ctaIcon}>
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m4.988 19.012 5.41-5.41m2.366-6.424 4.058 4.058-2.03 5.41L5.3 20 4 18.701l3.355-9.494 5.41-2.029Zm4.626 4.625L12.197 6.61 14.807 4 20 9.194l-2.61 2.61Z" />
                </svg>
              </div>
              <h2>Publish as Author</h2>
              <p>Share your knowledge and reach learners worldwide</p>
              <Button
                variant="accent"
                size="large"
                style={{ marginTop: "1rem" }}
              >
                Start Publishing
              </Button>
            </Card>

            <Card hover className={styles.ctaCard}>
              <div className={styles.ctaIcon}>
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2>Join Study Room</h2>
              <p>
                In future you will be able to join study room, collaborate and
                read in groups
              </p>
              <Button
                variant="outline"
                size="large"
                style={{ marginTop: "1rem" }}
                disabled
              >
                Coming Soon
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Featured Books</h2>
          {loading ? (
            <div className={styles.loadingPlaceholder}>Loading books...</div>
          ) : featuredBooks.length === 0 ? (
            <div className={styles.emptyPlaceholder}>
              No books available yet
            </div>
          ) : (
            <div className={styles.booksGrid}>
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} onClick={handleAnyClick} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Authors */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Featured Authors</h2>
          {loading ? (
            <div className={styles.loadingPlaceholder}>Loading authors...</div>
          ) : featuredAuthors.length === 0 ? (
            <div className={styles.emptyPlaceholder}>
              New authors joining soon
            </div>
          ) : (
            <div className={styles.authorsGrid}>
              {featuredAuthors.map((author, index) => (
                <Card
                  key={author.id}
                  hover
                  className={styles.authorCard}
                  onClick={handleAnyClick}
                >
                  <div
                    className={styles.authorAvatar}
                    style={{
                      background: `linear-gradient(135deg, ${authorColors[index % authorColors.length]}, ${authorColors[index % authorColors.length]}dd)`,
                    }}
                  >
                    {author.profile_image_url ? (
                      <img
                        src={author.profile_image_url}
                        alt={author.full_name}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <h3 className={styles.authorName}>{author.full_name}</h3>
                  <p className={styles.authorStats}>
                    {author.book_count || 0} Books
                  </p>
                  <Button
                    variant="secondary"
                    size="small"
                    style={{ marginTop: "1rem", width: "100%" }}
                    onClick={handleAnyClick}
                  >
                    View Profile
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Adhyaan */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose Adhyaan?</h2>
          <div className={styles.featuresGrid}>
            <Card hover className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3>Own Library</h3>
              <p>
                Access multiple books across multiple genres and subjects as
                your own library.
              </p>
            </Card>

            <Card hover className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3>Structured Learning</h3>
              <p>Follow board-wise, level-wise curriculum-based study paths</p>
            </Card>

            <Card hover className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>24/7 Access</h3>
              <p>
                Learn at your own pace, anytime and anywhere with full
                flexibility
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
