import React from 'react';
import styles from './BoardCard.module.css';

const BoardCard = ({ board, onClick, isSelected }) => {
  const getCardColorClass = (index) => {
    const colors = [
      'blue-gradient',
      'purple-gradient',
      'pink-gradient',
      'cyan-gradient',
      'green-gradient',
      'orange-gradient',
      'teal-gradient',
      'rose-gradient',
      'coral-gradient'
    ];
    return colors[index % colors.length];
  };

  return (
    <div
      className={`${styles.boardCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={`${styles.cardImage} ${styles[getCardColorClass(board.index || 0)]}`}>
        <div className={styles.cardAcronym}>{board.short}</div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardTitle}>{board.short}</div>
        <div className={styles.cardSubtitle}>{board.name}</div>
        <span className={styles.cardBadge}>
          {board.type === 'school' ? 'School Level' :
           board.type === 'university' ? 'University' :
           board.type === 'engineering' ? 'Engineering Institute' :
           board.type === 'science' ? 'Science & Technology' :
           board.type === 'medicine' ? 'Medical Institute' :
           board.type === 'diploma' ? 'Diploma/Certificate' : 'Education'}
        </span>
      </div>
    </div>
  );
};

export default BoardCard;