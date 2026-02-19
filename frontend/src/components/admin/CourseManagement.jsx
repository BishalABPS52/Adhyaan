'use client';

import { useState, useEffect } from 'react';
import courseService from '@/services/courseService';
import styles from './CourseManagement.module.css';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    short_code: '',
    level: 'undergraduate',
    board: '',
    total_semesters: '',
    total_years: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      window.alert('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const courseData = {
        ...formData,
        total_semesters: formData.total_semesters ? parseInt(formData.total_semesters) : null,
        total_years: formData.total_years ? parseInt(formData.total_years) : null,
      };

      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, courseData);
        window.alert('Course updated successfully');
      } else {
        await courseService.createCourse(courseData);
        window.alert('Course created successfully');
      }

      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      window.alert('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      short_code: course.short_code,
      level: course.level,
      board: course.board || '',
      total_semesters: course.total_semesters?.toString() || '',
      total_years: course.total_years?.toString() || '',
      description: course.description || '',
      is_active: course.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      window.alert('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      window.alert('Failed to delete course');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      short_code: '',
      level: 'undergraduate',
      board: '',
      total_semesters: '',
      total_years: '',
      description: '',
      is_active: true,
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Course Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Add Course'}
        </button>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Course Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Bachelor in Computer Engineering"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="short_code">Short Code *</label>
                <input
                  type="text"
                  id="short_code"
                  name="short_code"
                  value={formData.short_code}
                  onChange={handleInputChange}
                  required
                  placeholder="BCT"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="level">Level *</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="undergraduate">Undergraduate</option>
                  <option value="masters">Masters</option>
                  <option value="diploma">Diploma</option>
                  <option value="secondary">Secondary</option>
                  <option value="primary">Primary</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="board">Board/University</label>
                <input
                  type="text"
                  id="board"
                  name="board"
                  value={formData.board}
                  onChange={handleInputChange}
                  placeholder="TU, KU, PU, NEB, CBSE, CTEVT"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="total_semesters">Total Semesters</label>
                <input
                  type="number"
                  id="total_semesters"
                  name="total_semesters"
                  value={formData.total_semesters}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="8"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="total_years">Total Years</label>
                <input
                  type="number"
                  id="total_years"
                  name="total_years"
                  value={formData.total_years}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="4"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Course description..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                {editingCourse ? 'Update Course' : 'Create Course'}
              </button>
              <button type="button" onClick={resetForm} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.coursesList}>
        <h3>All Courses ({Array.isArray(courses) ? courses.length : 0})</h3>
        {loading ? (
          <div className={styles.loading}>
            <p>Loading courses...</p>
          </div>
        ) : !Array.isArray(courses) || courses.length === 0 ? (
          <div className={styles.empty}>
            <p>No courses available. Add your first course!</p>
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {(courses || []).map((course) => (
              <div key={course.id} className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <div>
                    <h4>{course.name}</h4>
                    <span className={styles.shortCode}>{course.short_code}</span>
                  </div>
                  <span className={`${styles.status} ${course.is_active ? styles.active : styles.inactive}`}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className={styles.courseInfo}>
                  <p><strong>Level:</strong> {course.level}</p>
                  {course.board && <p><strong>Board:</strong> {course.board}</p>}
                  {course.total_semesters && <p><strong>Semesters:</strong> {course.total_semesters}</p>}
                  {course.total_years && <p><strong>Years:</strong> {course.total_years}</p>}
                  {course.description && <p className={styles.description}>{course.description}</p>}
                </div>

                <div className={styles.courseActions}>
                  <button onClick={() => handleEdit(course)} className={styles.editButton}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(course.id)} className={styles.deleteButton}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
