import React from 'react';
import styles from './SemCard.module.css';

const SemCard = ({ year, part, semester, onClick, isSelected }) => {
  return (
    <div
      className={`${styles.semesterCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.semesterTitle}>Sem {semester}</div>
      <div className={styles.semesterSubtitle}>Year {year} Part {part}</div>
    </div>
  );
};

export default SemCard;