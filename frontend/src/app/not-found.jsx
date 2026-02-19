'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <div className={styles.actions}>
            <Link href="/">
              <Button variant="primary">Go Home</Button>
            </Link>
            <Link href="/reader/genres">
              <Button variant="outline">Browse Books</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
