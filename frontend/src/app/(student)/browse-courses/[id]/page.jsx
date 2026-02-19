'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import courseService from '@/services/courseService';
import styles from './course-detail.module.css';

export default function CourseDetailPage({ params }) {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [params.id]);

  useEffect(() => {
    if (course) {
      fetchCourseBooks();
    }
  }, [course, selectedSemester]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(params.id);
      setCourse(data);
      setError('');
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseBooks = async () => {
    try {
      const filters = {};
      if (selectedSemester) filters.semester = parseInt(selectedSemester);
      
      const data = await courseService.getCourseBooks(params.id, filters);
      setBooks(data);
    } catch (err) {
      console.error('Error fetching course books:', err);
    }
  };

  const handleBookClick = (bookId) => {
    router.push(`/books/${bookId}`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error || 'Course not found'}</p>
        <button onClick={() => router.push('/browse-courses')} className={styles.backButton}>
          Back to Courses
        </button>
      </div>
    );
  }

  const semesters = course.total_semesters
    ? Array.from({ length: course.total_semesters }, (_, i) => i + 1)
    : [];

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Back
      </button>

      <div className={styles.courseHeader}>
        <div className={styles.courseTitle}>
          <h1>{course.name}</h1>
          <span className={styles.shortCode}>{course.short_code}</span>
        </div>
        
        <div className={styles.courseMeta}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Level:</span>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
          {course.board && (
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Board:</span>
              {course.board}
            </span>
          )}
          {course.total_years && (
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Duration:</span>
              {course.total_years} years
            </span>
          )}
          {course.total_semesters && (
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Semesters:</span>
              {course.total_semesters}
            </span>
          )}
        </div>

        {course.description && (
          <p className={styles.courseDescription}>{course.description}</p>
        )}
      </div>

      {semesters.length > 0 && (
        <div className={styles.semesterFilter}>
          <label htmlFor="semester">Filter by Semester:</label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className={styles.select}
          >
            <option value="">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.booksSection}>
        <h2>Course Books</h2>
        
        {books.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📚</div>
            <h3>No books available</h3>
            <p>Books for this course will be added soon.</p>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map((book) => (
              <div
                key={book.id}
                className={styles.bookCard}
                onClick={() => handleBookClick(book.id)}
              >
                <div className={styles.bookHeader}>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  {book.is_required && (
                    <span className={styles.requiredBadge}>Required</span>
                  )}
                </div>
                
                {book.author && (
                  <p className={styles.bookAuthor}>by {book.author}</p>
                )}
                
                <div className={styles.bookMeta}>
                  {book.semester && (
                    <span className={styles.metaTag}>Semester {book.semester}</span>
                  )}
                  {book.year && (
                    <span className={styles.metaTag}>Year {book.year}</span>
                  )}
                  {book.part && (
                    <span className={styles.metaTag}>Part {book.part}</span>
                  )}
                  {book.genre && (
                    <span className={styles.metaTag}>{book.genre}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
