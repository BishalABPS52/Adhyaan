"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import BookCard from "@/components/book/BookCard";
import { formatGenre } from "@/utils/formatGenre";
import styles from "./page.module.css";

export default function BooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookType = searchParams.get("type"); // 'indie' or 'academic'

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState(bookType || "all");

  useEffect(() => {
    fetchBooks();
  }, [filter]);

  // Get API base URL from environment
  const getApiBaseUrl = () => {
    return (
      process.env.NEXT_PUBLIC_API_URL || "https://adhyaan.up.railway.app/api/v1"
    );
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      let url = `${baseUrl}/books/`;
      if (filter !== "all") {
        url += `?book_type=${filter}&limit=50`;
      } else {
        url += "?limit=50";
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      let url = `${baseUrl}/books/search?q=${encodeURIComponent(searchQuery)}`;
      if (filter !== "all") {
        url += `&book_type=${filter}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (e, book) => {
    e.stopPropagation(); // Prevent card click
    if (book && book.file_path) {
      // Check if it's a Cloudinary URL
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "https://adhyaan.up.railway.app";
      const fileUrl = book.file_path.startsWith("http")
        ? book.file_path
        : `${backendUrl}/${book.file_path}`;

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${book.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <h1>
            {filter === "indie"
              ? "Browse Genres"
              : filter === "academic"
                ? "Browse Academics"
                : "All Books"}
          </h1>
          <p className={styles.subtitle}>
            {filter === "indie"
              ? "Explore fiction, novels, and independent literature"
              : filter === "academic"
                ? "Find textbooks, study materials, and educational content"
                : "Discover all available books"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className={styles.controls}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="search"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>
              Search
            </button>
          </form>

          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
              onClick={() => setFilter("all")}
            >
              All Books
            </button>
            <button
              className={`${styles.filterBtn} ${filter === "indie" ? styles.active : ""}`}
              onClick={() => setFilter("indie")}
              data-type="indie"
            >
              Indie
            </button>
            <button
              className={`${styles.filterBtn} ${filter === "academic" ? styles.active : ""}`}
              onClick={() => setFilter("academic")}
              data-type="academic"
            >
              Academic
            </button>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className={styles.loading}>Loading books...</div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No books found</p>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} formatGenre={formatGenre} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
