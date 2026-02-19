'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function UnderDevelopment() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#094A8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <h1>Feature Under Development</h1>
        <p>We're working hard to bring this feature to you. Stay tuned!</p>
        <Link href="/" className={styles.backButton}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
