"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./BookProfile.module.css";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const BookProfile = ({ book }) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [ratings, setRatings] = useState([]);
  const [ratingsBreakdown, setRatingsBreakdown] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (book?.id) {
      fetchRatings();
    }
  }, [book?.id]);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://adhyaan.up.railway.app/api/v1";
      const response = await fetch(`${apiUrl}/books/${book.id}/ratings`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        setRatingsBreakdown(data.ratings_breakdown || {});
        setAverageRating(data.average_rating || 0);
        setTotalReviews(data.total_reviews || 0);
      }
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadBook = () => {
    if (book?.id) {
      router.push(`/reader/${book.id}`);
    } else {
      alert("Unable to open book. Book ID is missing.");
    }
  };

  // Use the passed book data and fetched ratings
  const bookData = {
    ...book,
    rating: averageRating,
    totalRatings: totalReviews,
    reviews: ratings.map((r) => ({
      id: r.id,
      userName: r.full_name || r.username,
      userAvatar: "👤",
      rating: r.rating,
      date: new Date(r.created_at).toLocaleDateString(),
      comment: r.review || "",
      likes: 0,
    })),
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleRatingClick = (rating) => {
    setUserRating(rating);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to submit a review");
        return;
      }

      // const apiUrl = "https://adhyaan.up.railway.app/api/v1";
      const apiUrl = "http://localhost:8000/api/v1";
      const response = await fetch(`${apiUrl}/books/${book.id}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newReview.rating,
          review: newReview.comment,
        }),
      });

      if (response.ok) {
        alert("Review submitted successfully!");
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: "" });
        fetchRatings(); // Refresh ratings
      } else {
        const error = await response.json();
        alert(`Failed to submit review: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const renderStars = (rating, interactive = false, size = "medium") => {
    return (
      <div className={`${styles.stars} ${styles[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.filled : ""} ${interactive ? styles.interactive : ""}`}
            onClick={() => interactive && handleRatingClick(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.bookProfile}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.coverSection}>
          <div className={styles.coverImage}>
            <div className={styles.coverPlaceholder}></div>
          </div>
        </div>

        <div className={styles.bookInfo}>
          <h1 className={styles.title}>{bookData.title}</h1>

          <div className={styles.authorInfo}>
            <span className={styles.authorAvatar}>
              {bookData.author.avatar}
            </span>
            <div>
              <p className={styles.authorName}>By {bookData.author.name}</p>
              <p className={styles.authorBio}>{bookData.author.bio}</p>
            </div>
          </div>

          <div className={styles.ratingSection}>
            <div className={styles.ratingDisplay}>
              {renderStars(bookData.rating, false, "large")}
              <span className={styles.ratingValue}>{bookData.rating}</span>
              <span className={styles.ratingCount}>
                ({bookData.totalRatings} ratings)
              </span>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>👥</span>
              <div>
                <p className={styles.statValue}>
                  {bookData.readerCount.toLocaleString()}
                </p>
                <p className={styles.statLabel}>Readers</p>
              </div>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statValue}>{bookData.pages}</p>
                <p className={styles.statLabel}>Pages</p>
              </div>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🌐</span>
              <div>
                <p className={styles.statValue}>{bookData.language}</p>
                <p className={styles.statLabel}>Language</p>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" size="large" onClick={handleReadBook}>
              📖Start Reading
            </Button>
            <Button
              variant={isBookmarked ? "secondary" : "outline"}
              size="large"
              onClick={handleBookmark}
            >
              {isBookmarked ? " Bookmarked" : " Bookmark"}
            </Button>
            <Button variant="outline" size="large" onClick={handleReadBook}>
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className={styles.section}>
        <Card>
          <h2 className={styles.sectionTitle}>About This Book</h2>
          <p className={styles.description}>{bookData.description}</p>

          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>ISBN:</span>
              <span className={styles.metadataValue}>{bookData.isbn}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Publisher:</span>
              <span className={styles.metadataValue}>{bookData.publisher}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Published:</span>
              <span className={styles.metadataValue}>
                {bookData.publishedDate}
              </span>
            </div>
          </div>

          <div className={styles.genres}>
            {bookData.genres.map((genre, index) => (
              <span key={index} className={styles.genreBadge}>
                {genre}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Rate This Book Section */}
      <div className={styles.section}>
        <Card>
          <h2 className={styles.sectionTitle}>Rate This Book</h2>
          <p className={styles.ratePrompt}>
            Share your thoughts with other readers
          </p>
          <div className={styles.userRating}>
            {renderStars(userRating, true, "large")}
            {userRating > 0 && (
              <span className={styles.userRatingText}>
                You rated: {userRating} stars
              </span>
            )}
          </div>
          {userRating > 0 && !showReviewForm && (
            <Button
              variant="primary"
              onClick={() => setShowReviewForm(true)}
              className={styles.writeReviewBtn}
            >
              ✍️ Write a Review
            </Button>
          )}
        </Card>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className={styles.section}>
          <Card>
            <h2 className={styles.sectionTitle}>Write Your Review</h2>
            <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
              <div className={styles.formGroup}>
                <label>Your Rating</label>
                {renderStars(newReview.rating, true, "large")}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="reviewComment">Your Review</label>
                <textarea
                  id="reviewComment"
                  className={styles.textarea}
                  rows="5"
                  placeholder="Share your thoughts about this book..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formActions}>
                <Button type="submit" variant="primary">
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Reviews Section */}
      <div className={styles.section}>
        <Card>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>
              Reviews ({bookData.reviews.length})
            </h2>
            <select className={styles.sortSelect}>
              <option>Most Helpful</option>
              <option>Most Recent</option>
              <option>Highest Rated</option>
              <option>Lowest Rated</option>
            </select>
          </div>

          <div className={styles.reviewsList}>
            {bookData.reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <span className={styles.reviewAvatar}>
                      {review.userAvatar}
                    </span>
                    <div>
                      <p className={styles.reviewUserName}>{review.userName}</p>
                      <p className={styles.reviewDate}>{review.date}</p>
                    </div>
                  </div>
                  {renderStars(review.rating, false, "small")}
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
                <div className={styles.reviewFooter}>
                  <button className={styles.likeButton}>
                    Helpful ({review.likes})
                  </button>
                  <button className={styles.replyButton}>Reply</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BookProfile;
