'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getApiBaseUrl } from '@/services/api';
import styles from './page.module.css';

export default function SearchPage() {
  const router = useRouter();
  const [selectedSearchType, setSelectedSearchType] = useState(null);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/books/?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setAllBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSelection = (type) => {
    if (type === 'reader') {
      router.push('/search/reader');
    } else if (type === 'student') {
      router.push('/search/student');
    }
  };

  const handleQuickSearchChange = (e) => {
    const query = e.target.value;
    setQuickSearchQuery(query);

    if (query.trim().length > 0) {
      setIsSearching(true);
      // Filter books based on search query
      const filtered = allBooks.filter(book => {
        const title = book.book_name || book.title || '';
        const author = book.author_name || book.author || '';
        const genre = book.genre || '';
        const subject = book.subject_name || book.subject || '';
        
        return title.toLowerCase().includes(query.toLowerCase()) ||
               author.toLowerCase().includes(query.toLowerCase()) ||
               genre.toLowerCase().includes(query.toLowerCase()) ||
               subject.toLowerCase().includes(query.toLowerCase());
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (e) => {
    if (e.key === 'Enter' && quickSearchQuery.trim()) {
      // Keep showing results, don't navigate away
      setIsSearching(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Search</h1>
          <p className={styles.subtitle}>Search all books, PDFs, and academic materials</p>
        </div>

        {/* Quick Search - Global Search Bar */}
        <div className={styles.quickSearchSection}>
          <div className={styles.quickSearchInput}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="search" 
              placeholder="Quick search: Search all books, PDFs, novels, textbooks, courses..."
              value={quickSearchQuery}
              onChange={handleQuickSearchChange}
              onKeyDown={handleQuickSearch}
              className={styles.globalSearchInput}
            />
          </div>
          <p className={styles.quickSearchHint}>
            {isSearching ? `${searchResults.length} results found` : 'Start typing to search across all content'}
          </p>
        </div>

        {/* Search Results */}
        {isSearching && searchResults.length > 0 && (
          <div className={styles.searchResultsSection}>
            <h3 className={styles.resultsTitle}>Search Results</h3>
            <div className={styles.resultsGrid}>
              {searchResults.map(book => (
                <Card key={book.id} hover className={styles.resultCard}>
                  <div className={styles.resultCover} style={{ background: `linear-gradient(135deg, ${book.cover}, ${book.cover}dd)` }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                      {book.type === 'Reader' ? (
                        <>
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </>
                      ) : (
                        <>
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </>
                      )}
                    </svg>
                  </div>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultType}>{book.book_type || book.type}</span>
                    <h4 className={styles.resultTitle}>{book.book_name || book.title}</h4>
                    <p className={styles.resultAuthor}>by {book.author_name || book.author || 'Unknown'}</p>
                    <div className={styles.resultMeta}>
                      <span className={styles.resultBadge}>
                        {book.genre || book.subject_name || book.subject}
                      </span>
                      {book.level && <span className={styles.resultBadge}>{book.level}</span>}
                    </div>
                    <div className={styles.resultFooter}>
                      <span className={styles.resultRating}>⭐ {book.avg_rating || book.rating || '0.0'}</span>
                      <Button 
                        variant="primary" 
                        size="small"
                        onClick={() => router.push(`/reader/${book.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isSearching && searchResults.length === 0 && (
          <div className={styles.noResults}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No results found</h3>
            <p>Try searching with different keywords</p>
          </div>
        )}

        {/* Category Search Options - Hidden when searching */}
        {!isSearching && (
          <>
            <div className={styles.categorySeparator}>
              <span>Or browse by category</span>
            </div>

            <div className={styles.searchTypeGrid}>
          <Card 
            className={styles.searchTypeCard} 
            hover
            onClick={() => handleSearchSelection('reader')}
          >
            <div className={styles.searchTypeIcon} style={{ background: 'linear-gradient(135deg, #1F5FA8 0%, #3B82F6 100%)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className={styles.searchTypeContent}>
              <h2>Search for Readers</h2>
              <p>Browse books, novels, stories, and digital library content</p>
              <div className={styles.searchTypeFeatures}>
                <span className={styles.featureTag}> Books</span>
                <span className={styles.featureTag}> Novels</span>
                <span className={styles.featureTag}> Stories</span>
                <span className={styles.featureTag}> Genres</span>
              </div>
            </div>
            <Button variant="primary" size="medium" style={{ marginTop: '1rem' }}>
              Search Readers Content →
            </Button>
          </Card>

          <Card 
            className={styles.searchTypeCard} 
            hover
            onClick={() => handleSearchSelection('student')}
          >
            <div className={styles.searchTypeIcon} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className={styles.searchTypeContent}>
              <h2>Search for Students</h2>
              <p>Find academic materials, textbooks, courses, and study resources</p>
              <div className={styles.searchTypeFeatures}>
                <span className={styles.featureTag}> Textbooks</span>
                <span className={styles.featureTag}> Courses</span>
                <span className={styles.featureTag}> Subjects</span>
                <span className={styles.featureTag}> Boards</span>
              </div>
            </div>
            <Button variant="primary" size="medium" style={{ marginTop: '1rem' }}>
              Search Students Content →
            </Button>
          </Card>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
