"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import BookCard from "@/components/book/BookCard";
import { getApiBaseUrl } from "@/services/api";
import styles from "./page.module.css";

export default function StudentSearchSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedPart, setSelectedPart] = useState("all");
  const [selectedSem, setSelectedSem] = useState("all");
  const [studyBooks, setStudyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyBooks();
  }, []);

  const fetchStudyBooks = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(
        `${baseUrl}/books/?book_type=academic&limit=100`,
      );
      if (response.ok) {
        const data = await response.json();
        setStudyBooks(data.books || []);
      }
    } catch (error) {
      console.error("Error fetching study books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculation logic
  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year !== "all" && selectedPart !== "all") {
      const y = parseInt(year);
      const s = selectedPart === "i" ? 2 * y - 1 : 2 * y;
      setSelectedSem(s.toString());
    } else {
      setSelectedSem("all");
    }
  };

  const handlePartChange = (part) => {
    setSelectedPart(part);
    if (selectedYear !== "all" && part !== "all") {
      const y = parseInt(selectedYear);
      const s = part === "i" ? 2 * y - 1 : 2 * y;
      setSelectedSem(s.toString());
    } else {
      setSelectedSem("all");
    }
  };

  const handleSemChange = (sem) => {
    setSelectedSem(sem);
    if (sem !== "all") {
      const s = parseInt(sem);
      const y = Math.ceil(s / 2);
      const p = s % 2 === 1 ? "i" : "ii";
      setSelectedYear(y.toString());
      setSelectedPart(p);
    }
  };

  /* State for filter options */
  const [boardOptions, setBoardOptions] = useState(["All"]);
  const [yearOptions, setYearOptions] = useState(["All", "1", "2", "3", "4"]);
  const [partOptions, setPartOptions] = useState(["All", "I", "II"]);
  const [semOptions, setSemOptions] = useState([
    "All",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
  ]);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/books/academic/boards`);
      if (response.ok) {
        const data = await response.json();
        // data.boards is array of {name, type}
        const backendBoards = data.boards.map((b) => b.name);
        // Merge with defaults if needed, or just use backend
        // We ensure "All" is first
        const uniqueBoards = Array.from(new Set(["All", ...backendBoards]));
        setBoardOptions(uniqueBoards);
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
      // Fallback
      setBoardOptions([
        "All",
        "TU",
        "KU",
        "PU Pokhara",
        "PU Purbanchal",
        "NEB",
        "CBSE",
        "CTEVT",
        "Others",
      ]);
    }
  };

  const filteredBooks = studyBooks.filter((book) => {
    const title = (book.book_name || book.title || "").toLowerCase();
    const subject = (book.subject_name || "").toLowerCase();
    const bookBoard = (book.board || "").toLowerCase();
    const bookYear = book.year?.toString();
    const bookPart = book.part?.toLowerCase();
    const bookSem = book.semester?.toString();
    const query = searchQuery.toLowerCase();

    const matchesSearch = title.includes(query) || subject.includes(query);
    const matchesBoard =
      selectedBoard === "all" || bookBoard === selectedBoard.toLowerCase();
    const matchesYear = selectedYear === "all" || bookYear === selectedYear;
    const matchesPart = selectedPart === "all" || bookPart === selectedPart;
    const matchesSem = selectedSem === "all" || bookSem === selectedSem;

    return (
      matchesSearch && matchesBoard && matchesYear && matchesPart && matchesSem
    );
  });

  const mostReadBooks = filteredBooks.slice(0, 4);

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Student Search Section</h1>
          <p className={styles.pageSubtitle}>
            Explore academic books based on board, course and curriculum
          </p>
        </div>

        {/* Search and Filters */}
        <Card className={styles.searchCard}>
          <div className={styles.searchBar}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search study materials by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Board/University</label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className={styles.select}
              >
                {boardOptions.map((board) => (
                  <option key={board} value={board.toLowerCase()}>
                    {board}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className={styles.select}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year.toLowerCase()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Part</label>
              <select
                value={selectedPart}
                onChange={(e) => handlePartChange(e.target.value)}
                className={styles.select}
              >
                {partOptions.map((part) => (
                  <option key={part} value={part.toLowerCase()}>
                    {part}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Semester</label>
              <select
                value={selectedSem}
                onChange={(e) => handleSemChange(e.target.value)}
                className={styles.select}
              >
                {semOptions.map((sem) => (
                  <option key={sem} value={sem.toLowerCase()}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Study Books Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Browse Study Books</h2>
          {loading ? (
            <p>Loading study books...</p>
          ) : filteredBooks.length === 0 ? (
            <p>No books found matching your criteria.</p>
          ) : (
            <div className={styles.booksGrid}>
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>

        {/* Most Read Study Books */}
        {filteredBooks.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Most Read Study Books</h2>
            <div className={styles.booksGrid}>
              {mostReadBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
