'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BookCard from '@/components/book/BookCard';
import { formatGenre } from '@/utils/formatGenre';
import { getApiBaseUrl } from '@/services/api';
import styles from './page.module.css';

export default function ReaderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const genres = ['All', 'Fiction', 'Non-Fiction', 'Romance', 'Mystery', 'Sci-Fi', 'Fantasy', 'Thriller', 'Biography', 'Novel', 'Short Story'];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/books/indie?limit=100`);
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

  const filteredBooks = books.filter(book => {
    const title = (book.book_name || book.title || '').toLowerCase();
    const author = (book.author_name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = title.includes(query) || author.includes(query);
    const matchesGenre = selectedGenre === 'all' || (book.genre && book.genre.toLowerCase() === selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Reader's Section</h1>
          <p className={styles.pageSubtitle}>Explore indie books, novels or reader section</p>
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
              <div className={styles.genreTags}>
                {genres.map(genre => (
                  <button
                    key={genre}
                    className={`${styles.genreTag} ${selectedGenre === genre.toLowerCase() ? styles.active : ''}`}
                    onClick={() => setSelectedGenre(genre.toLowerCase())}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Collections */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{searchQuery || selectedGenre !== 'all' ? 'Filtered Books' : 'All Indie Books'}</h2>
            <span className={styles.resultCount}>{filteredBooks.length} books found</span>
          </div>
          
          {loading ? (
            <div className={styles.loader}>
              <div className={styles.spinner}></div>
              <p>Fetching amazing stories...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className={styles.noResults}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="m14 11-4 4m0-4 4 4"/>
              </svg>
              <h3>No books found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={styles.booksGrid}>
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} formatGenre={formatGenre} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
