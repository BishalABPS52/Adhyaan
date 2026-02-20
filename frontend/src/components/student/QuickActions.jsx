"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./QuickActions.module.css";

const QuickActions = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuggestion = async () => {
    setLoading(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://adhyaan.up.railway.app/api/v1";
      const response = await fetch(`${apiUrl}/books/random`);
      if (response.ok) {
        const book = await response.json();
        router.push(`/reader/${book.id}`);
      } else {
        alert("No books available at the moment");
      }
    } catch (error) {
      console.error("Error fetching random book:", error);
      alert("Failed to get suggestion");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseGenres = () => {
    router.push("/books?type=indie");
  };

  const handleBrowseAcademics = () => {
    router.push("/books?type=academic");
  };

  return (
    <div className={styles.quickActions}>
      <h2 className={styles.heading}>Quick Actions</h2>
      <div className={styles.actionsGrid}>
        <button
          className={styles.actionCard}
          onClick={handleSuggestion}
          disabled={loading}
        >
          <div className={styles.actionIcon}>🎲</div>
          <div className={styles.actionTitle}>Suggestion</div>
          <p className={styles.actionDesc}>Get a random book recommendation</p>
        </button>

        <button className={styles.actionCard} onClick={handleBrowseGenres}>
          <div className={styles.actionIcon}>📚</div>
          <div className={styles.actionTitle}>Browse Genres</div>
          <p className={styles.actionDesc}>Explore indie books and novels</p>
        </button>

        <button className={styles.actionCard} onClick={handleBrowseAcademics}>
          <div className={styles.actionIcon}>🎓</div>
          <div className={styles.actionTitle}>Browse Academics</div>
          <p className={styles.actionDesc}>
            Find textbooks and study materials
          </p>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
