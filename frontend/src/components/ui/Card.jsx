import React from 'react';
import styles from './Card.module.css';

const Card = ({ 
  children, 
  hover = false, 
  className = '',
  onClick,
  padding = 'medium',
}) => {
  return (
    <div 
      className={`${styles.card} ${hover ? styles.hover : ''} ${styles[padding]} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
