'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import courseService from '@/services/courseService';
import styles from './browse-courses.module.css';

export default function BrowseCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel, selectedBoard]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedLevel) filters.level = selectedLevel;
      if (selectedBoard) filters.board = selectedBoard;
      
      const data = await courseService.getAllCourses(filters);
      setCourses(data);
      setError('');
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    router.push(`/browse-courses/${courseId}`);
  };

  const levels = ['undergraduate', 'masters', 'diploma', 'secondary', 'primary'];
  const boards = ['TU', 'KU', 'PU', 'NEB', 'CBSE', 'CTEVT'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Browse by Course</h1>
        <p>Find academic books organized by your course and curriculum</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="level">Level</label>
          <select
            id="level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className={styles.select}
          >
            <option value="">All Levels</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="board">Board/University</label>
          <select
            id="board"
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className={styles.select}
          >
            <option value="">All Boards</option>
            {boards.map((board) => (
              <option key={board} value={board}>
                {board}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📚</div>
          <h3>No courses found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className={styles.coursesGrid}>
          {courses.map((course) => (
            <div
              key={course.id}
              className={styles.courseCard}
              onClick={() => handleCourseClick(course.id)}
            >
              <div className={styles.courseHeader}>
                <span className={styles.shortCode}>{course.short_code}</span>
                <span className={styles.level}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
              </div>
              <h3 className={styles.courseName}>{course.name}</h3>
              {course.description && (
                <p className={styles.courseDescription}>{course.description}</p>
              )}
              <div className={styles.courseInfo}>
                {course.board && (
                  <span className={styles.infoItem}>
                    <span className={styles.infoLabel}>Board:</span> {course.board}
                  </span>
                )}
                {course.total_semesters && (
                  <span className={styles.infoItem}>
                    <span className={styles.infoLabel}>Semesters:</span> {course.total_semesters}
                  </span>
                )}
                {course.total_years && (
                  <span className={styles.infoItem}>
                    <span className={styles.infoLabel}>Duration:</span> {course.total_years} years
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
