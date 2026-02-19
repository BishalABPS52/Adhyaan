import React from 'react';
import styles from './CourseCard.module.css';

const CourseCard = ({ course, onClick, isSelected, index }) => {
  const getCardColorClass = (index) => {
    const colors = [
      'primary-gradient',
      'purple-gradient',
      'pink-gradient'
    ];
    return colors[index % colors.length];
  };

  return (
    <div
      className={`${styles.courseCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={`${styles.cardHeader} ${styles[getCardColorClass(index)]}`}>
        <div className={styles.courseAcronym}>{course.short}</div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardTitle}>{course.name}</div>
        <div className={styles.cardSubtitle}>
          {course.type === 'engineering' ? 'Engineering Program' :
           course.type === 'medicine' ? 'Medical Program' :
           course.type === 'science' ? 'Science & Technology Program' :
           course.type === 'university' ? 'University Program' :
           course.type === 'school' ? 'School Level Program' :
           course.type === 'diploma' ? 'Diploma/Certificate Program' : 'Academic Program'}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;