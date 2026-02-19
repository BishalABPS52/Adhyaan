'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BookCard from '@/components/book/BookCard';
import { formatGenre } from '@/utils/formatGenre';
import styles from './page.module.css';

export default function StudentSearchSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSemPart, setSelectedSemPart] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [browseMode, setBrowseMode] = useState(null); // null, 'course', 'books'

  const levels = ['All', 'Primary/Basics', 'Secondary', 'Undergraduate', 'Masters', 'Diploma'];

  // Get Sem/Part or Class/Year options based on level
  const getSemPartOptions = () => {
    if (selectedLevel === 'primary/basics') return ['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];
    if (selectedLevel === 'secondary') return ['All', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    if (selectedLevel === 'undergraduate') {
      return [
        'All',
        'Sem 1 / Year 1 Part 1',
        'Sem 2 / Year 1 Part 2',
        'Sem 3 / Year 2 Part 1',
        'Sem 4 / Year 2 Part 2',
        'Sem 5 / Year 3 Part 1',
        'Sem 6 / Year 3 Part 2',
        'Sem 7 / Year 4 Part 1',
        'Sem 8 / Year 4 Part 2'
      ];
    }
    if (selectedLevel === 'masters') {
      return ['All', 'Sem 1 / Year 1 Part 1', 'Sem 2 / Year 1 Part 2', 'Sem 3 / Year 2 Part 1', 'Sem 4 / Year 2 Part 2'];
    }
    if (selectedLevel === 'diploma') {
      return ['All', 'Sem 1 / Year 1 Part 1', 'Sem 2 / Year 1 Part 2', 'Sem 3 / Year 2 Part 1', 'Sem 4 / Year 2 Part 2', 'Sem 5 / Year 3 Part 1', 'Sem 6 / Year 3 Part 2'];
    }
    return ['All'];
  };

  const getBoardOptions = () => {
    if (selectedLevel === 'primary/basics' || selectedLevel === 'secondary') {
      return ['All', 'NEB', 'CBSE'];
    }
    if (selectedLevel === 'undergraduate' || selectedLevel === 'masters') {
      return ['All', 'TU', 'KU', 'PU Purbanchal', 'PU Pokhara', 'Others'];
    }
    if (selectedLevel === 'diploma') {
      return ['All', 'CTEVT', 'Others'];
    }
    return ['All'];
  };

  // Bachelor Courses for Undergraduate
  const bachelorCourses = [
    { id: 1, name: 'Bachelor in Computer Engineering (BCE)', short: 'BCE', semesters: 8, color: '#1F5FA8' },
    { id: 2, name: 'Bachelor in Civil Engineering (BCT)', short: 'BCT', semesters: 8, color: '#10B981' },
    { id: 3, name: 'Bachelor in Business Administration (BBA)', short: 'BBA', semesters: 8, color: '#F4C430' },
    { id: 4, name: 'Bachelor in Electrical Engineering (BEE)', short: 'BEE', semesters: 8, color: '#8B5CF6' },
    { id: 5, name: 'Bachelor in Information Technology (BIT)', short: 'BIT', semesters: 8, color: '#EF4444' },
    { id: 6, name: 'Bachelor in Mechanical Engineering (BME)', short: 'BME', semesters: 8, color: '#3B82F6' },
  ];

  // Masters Programs
  const mastersCourses = [
    { id: 1, name: 'Masters in Business Administration (MBA)', short: 'MBA', semesters: 4, color: '#1F5FA8' },
    { id: 2, name: 'Masters in Computer Science (MCS)', short: 'MCS', semesters: 4, color: '#10B981' },
    { id: 3, name: 'Masters in Engineering (M.E)', short: 'M.E', semesters: 4, color: '#F4C430' },
    { id: 4, name: 'Masters in Economics (M.A)', short: 'M.A', semesters: 4, color: '#8B5CF6' },
  ];

  // Diploma Programs
  const diplomaCourses = [
    { id: 1, name: 'Diploma in Civil Engineering', short: 'DCE', years: 3, color: '#1F5FA8' },
    { id: 2, name: 'Diploma in Electrical Engineering', short: 'DEE', years: 3, color: '#10B981' },
    { id: 3, name: 'Diploma in Computer Engineering', short: 'DCOE', years: 3, color: '#F4C430' },
    { id: 4, name: 'Diploma in Mechanical Engineering', short: 'DME', years: 3, color: '#8B5CF6' },
    { id: 5, name: 'Diploma in Surveying', short: 'DSURVEY', years: 3, color: '#EF4444' },
  ];

  const studyBooks = [
    { id: 1, title: 'Physics Grade 11', level: 'Secondary', class: 'Class 11', board: 'NEB', subject: 'Physics', rating: 4.9, students: '5.2k', cover: '#1F5FA8' },
    { id: 2, title: 'Mathematics Class 10', level: 'Secondary', class: 'Class 10', board: 'NEB', subject: 'Mathematics', rating: 4.8, students: '6.1k', cover: '#F4C430' },
    { id: 3, title: 'Data Structures (Sem 3)', level: 'Undergraduate', class: 'Sem 3 / Year 2 Part 1', board: 'TU', subject: 'Computer Science', rating: 4.7, students: '3.8k', cover: '#10B981' },
    { id: 4, title: 'English Grade 12', level: 'Secondary', class: 'Class 12', board: 'CBSE', subject: 'English', rating: 4.6, students: '4.5k', cover: '#8B5CF6' },
    { id: 5, title: 'Applied Mechanics (Sem 1)', level: 'Diploma', class: 'Sem 1 / Year 1 Part 1', board: 'CTEVT', subject: 'Engineering', rating: 4.8, students: '2.9k', cover: '#EF4444' },
    { id: 6, title: 'Biology Grade 11', level: 'Secondary', class: 'Class 11', board: 'NEB', subject: 'Biology', rating: 4.9, students: '5.7k', cover: '#3B82F6' },
    { id: 7, title: 'Business Management (Sem 2)', level: 'Masters', class: 'Sem 2 / Year 1 Part 2', board: 'TU', subject: 'Business', rating: 4.9, students: '1.8k', cover: '#1F5FA8' },
  ];

  const filteredBooks = studyBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         book.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || book.level.toLowerCase() === selectedLevel.toLowerCase();
    const matchesSemPart = selectedSemPart === 'all' || book.class.toLowerCase() === selectedSemPart.toLowerCase();
    const matchesBoard = selectedBoard === 'all' || book.board.toLowerCase() === selectedBoard.toLowerCase();
    return matchesSearch && matchesLevel && matchesSemPart && matchesBoard;
  });

  const mostReadBooks = filteredBooks.slice(0, 4);

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <Link href="/search" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Search
          </Link>
          <h1 className={styles.pageTitle}>Student Search</h1>
          <p className={styles.pageSubtitle}>Academic curriculum-based study materials</p>
        </div>

        {/* Search and Filters */}
        <Card className={styles.searchCard}>
          <div className={styles.searchBar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
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
              <label>Level</label>
              <select 
                value={selectedLevel} 
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setSelectedSemPart('all');
                  setSelectedBoard('all');
                  setBrowseMode(null);
                }} 
                className={styles.select}
              >
                {levels.map(level => (
                  <option key={level} value={level.toLowerCase()}>{level}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>{selectedLevel === 'undergraduate' || selectedLevel === 'masters' || selectedLevel === 'diploma' ? 'Sem/Part' : 'Class/Year'}</label>
              <select 
                value={selectedSemPart} 
                onChange={(e) => setSelectedSemPart(e.target.value)} 
                className={styles.select}
                disabled={selectedLevel === 'all'}
              >
                {getSemPartOptions().map(item => (
                  <option key={item} value={item.toLowerCase()}>{item}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Board/University</label>
              <select 
                value={selectedBoard} 
                onChange={(e) => setSelectedBoard(e.target.value)} 
                className={styles.select}
                disabled={selectedLevel === 'all'}
              >
                {getBoardOptions().map(board => (
                  <option key={board} value={board.toLowerCase()}>{board}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Browse Mode Selection for Undergraduate, Masters, and Diploma */}
        {(selectedLevel === 'undergraduate' || selectedLevel === 'masters' || selectedLevel === 'diploma') && (
          <div className={styles.browseModeSection}>
            <p className={styles.browseModeLabel}>Choose browse mode:</p>
            <div className={styles.browseModeButtons}>
              <button 
                className={`${styles.browseModeBtn} ${browseMode === 'course' ? styles.active : ''}`}
                onClick={() => setBrowseMode(browseMode === 'course' ? null : 'course')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                Browse by {selectedLevel === 'diploma' ? 'Diploma' : 'Course'}
              </button>
              <button 
                className={`${styles.browseModeBtn} ${browseMode === 'books' ? styles.active : ''}`}
                onClick={() => setBrowseMode(browseMode === 'books' ? null : 'books')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                Browse by Books
              </button>
            </div>
          </div>
        )}

        {/* Browse by Course Section */}
        {browseMode === 'course' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {selectedLevel === 'undergraduate' && 'Bachelor Courses'}
              {selectedLevel === 'masters' && 'Masters Programs'}
              {selectedLevel === 'diploma' && 'Diploma Programs'}
            </h2>
            <div className={styles.coursesGrid}>
              {(selectedLevel === 'undergraduate' ? bachelorCourses : selectedLevel === 'masters' ? mastersCourses : diplomaCourses).map(course => (
                <Card key={course.id} hover className={styles.courseCard}>
                  <div className={styles.courseIcon} style={{ background: `${course.color}20`, borderLeft: `4px solid ${course.color}` }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: course.color }}>
                      {course.short}
                    </div>
                  </div>
                  <div className={styles.courseInfo}>
                    <h3 className={styles.courseName}>{course.name}</h3>
                    <p className={styles.courseMeta}>
                      {selectedLevel === 'diploma' ? `${course.years} Years` : `${course.semesters} Semesters`}
                    </p>
                    <Button variant="primary" size="small" style={{ width: '100%', marginTop: '0.75rem' }}>
                      View Course
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Books Section */}
        {browseMode === 'books' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Browse Study Books by {selectedLevel === 'undergraduate' ? 'Course' : 'Program'}</h2>
            <div className={styles.booksGrid}>
              {filteredBooks.map((book, index) => (
                <BookCard key={book.id || `search-study-book-${index}`} book={book} formatGenre={formatGenre} />
              ))}
            </div>
          </section>
        )}

        {/* Default Browse Study Books Section (when no browse mode selected) */}
        {!browseMode && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Browse Study Books</h2>
            <div className={styles.booksGrid}>
              {filteredBooks.map((book, index) => (
                <BookCard key={book.id || `default-search-study-book-${index}`} book={book} formatGenre={formatGenre} />
              ))}
            </div>
          </section>
        )}

        {/* Most Read Study Books */}
        {!browseMode && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Most Read Study Books</h2>
            <div className={styles.trendingGrid}>
              {mostReadBooks.map(book => (
                <Card key={book.id} hover className={styles.trendingCard}>
                  <div className={styles.trendingCover} style={{ background: `linear-gradient(135deg, ${book.cover}, ${book.cover}dd)` }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                  </div>
                  <div className={styles.trendingInfo}>
                    <h4 className={styles.trendingTitle}>{book.title}</h4>
                    <p className={styles.trendingSubject}>{book.subject}</p>
                    <p className={styles.trendingDetails}>{book.level} • {book.board}</p>
                    <div className={styles.trendingMeta}>
                      <span>⭐ {book.rating}</span>
                      <span>{book.students} students</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
