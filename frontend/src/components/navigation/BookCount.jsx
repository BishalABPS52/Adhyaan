"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import styles from "./Navbar.module.css";

const BookCount = () => {
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await apiService.get("/books/count");
        setCount(response.count);
      } catch (error) {
        console.error("Error fetching book count:", error);
      }
    };
    fetchCount();
  }, []);

  return (
    <div
      className={styles.bookCountContainer}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <button
        className={styles.navActionBtn}
        title={`Adhyaan Book Count: ${count}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.countDropdown}>
          <p>
            Adhyaan Book Count: <strong>{count}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default BookCount;
