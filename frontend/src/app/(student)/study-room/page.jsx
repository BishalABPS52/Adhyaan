'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function StudyRoom() {
  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.developmentBanner}>
          <div className={styles.iconWrapper}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 className={styles.title}>Study Rooms</h1>
          <p className={styles.subtitle}>Collaborative learning spaces coming soon!</p>
          
          <Card className={styles.statusCard}>
            <div className={styles.statusBadge}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>Under Development</span>
            </div>
            
            <p className={styles.description}>
              We're building an amazing study room feature where you can:
            </p>
            
            <ul className={styles.featureList}>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Join live study sessions with peers
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Collaborate on study materials
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Share notes and resources
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Join using unique room codes
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Participate in group discussions
              </li>
            </ul>
            
            <div className={styles.comingSoon}>
              <h3>Stay tuned!</h3>
              <p>This feature will be available very soon. We're working hard to bring you the best collaborative learning experience.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
