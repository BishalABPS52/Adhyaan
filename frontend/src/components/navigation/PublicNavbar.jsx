'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '../theme/ThemeToggle';
import Button from '../ui/Button';
import styles from './Navbar.module.css';

const PublicNavbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo/adhyaan.png" 
            alt="Adhyaan Logo" 
            width={200} 
            height={200}
            style={{ objectFit: 'contain' }}
            priority
          />
          <span className={styles.logoText}>Adhyaan</span>
        </Link>

        <div className={styles.searchBar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="search" 
            placeholder="Search books..." 
            className={styles.searchInput}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          />
        </div>

        <div className={styles.navActions}>
          <ThemeToggle />
          <Link href="/auth/login">
            <Button variant="primary" size="small">Sign In / Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
