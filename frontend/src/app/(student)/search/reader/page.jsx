'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BookCard from '@/components/book/BookCard';
import { formatGenre } from '@/utils/formatGenre';
import { getApiBaseUrl } from '@/services/api';
import styles from './page.module.css';

export default function ReaderSearchSection() {
  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); // delayed copy of searchQuery
  const [selectedGenre, setSelectedGenre]   = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);

  const genres    = ['All', 'Fiction', 'Non-Fiction', 'Romance', 'Mystery', 'Sci-Fi', 'Fantasy', 'Thriller', 'Biography'];
  const languages = ['All', 'English', 'Hindi', 'Nepali', 'Spanish', 'French'];

  // exactly the same fetch as the original — nothing changed here
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/books/?book_type=indie&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  // debounce — waits 400ms after user stops typing then updates debouncedQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer); // cancel if user types again within 400ms
  }, [searchQuery]);

  const filteredBooks = books.filter(book => {
    const title  = (book.book_name || book.title || '').toLowerCase();
    const author = (book.author_name || '').toLowerCase();
    const query  = debouncedQuery.toLowerCase();

    const matchesSearch   = query === '' || title.includes(query) || author.includes(query);
    const matchesGenre    = selectedGenre === 'all' || (book.genre && book.genre.toLowerCase() === selectedGenre.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || (book.language && book.language.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSearch && matchesGenre && matchesLanguage;
  });

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Reader Search Section</h1>
          <p className={styles.pageSubtitle}>Search books, novels, stories, and more</p>
        </div>

        {/* Search and Filters */}
        <Card className={styles.searchCard}>
          <div className={styles.searchBar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Search by title, author, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className={styles.select}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre.toLowerCase()}>{genre}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.select}
              >
                {languages.map(language => (
                  <option key={language} value={language.toLowerCase()}>{language}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Search Results */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Search Results</h2>
            <span className={styles.resultCount}>{filteredBooks.length} books found</span>
          </div>
          <div className={styles.booksGrid}>
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} formatGenre={formatGenre} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}