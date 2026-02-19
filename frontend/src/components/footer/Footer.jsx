"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Explore Section */}
          <div className={styles.footerColumn}>
            <h3>Explore Adhyaan</h3>
            <ul>
              <li>
                <Link href="/books">Browse Books</Link>
              </li>
              <li>
                <Link href="/books">All Books</Link>
              </li>
              <li>
                <Link href="/student">Study Materials</Link>
              </li>
              <li>
                <Link href="/under-development">Join Study Room</Link>
              </li>
              <li>
                <Link href="/search">Search</Link>
              </li>
            </ul>
          </div>

          {/* For Authors Section */}
          <div className={styles.footerColumn}>
            <h3>For Authors</h3>
            <ul>
              <li>
                <Link href="/dashboard">Publish Your Book</Link>
              </li>
              <li>
                <Link href="/under-development">Create Study Room</Link>
              </li>
              <li>
                <Link href="/dashboard/author">Author Dashboard</Link>
              </li>
              <li>
                <Link href="/help">Author Guidelines</Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className={styles.footerColumn}>
            <h3>Resources</h3>
            <ul>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/help">Help Center</Link>
              </li>
              <li>
                <Link href="/contactus">Contact Us</Link>
              </li>
              <li>
                <Link href="/help">Updates</Link>
              </li>
              <li>
                <Link href="/help">FAQ's</Link>
              </li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div className={styles.footerColumn}>
            <h3>Follow us</h3>
            <div className={styles.socialLinks}>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.86-.2-2.19.04-3.13.2-.84 1.38-5.86 1.38-5.86s-.35-.7-.35-1.74c0-1.63.95-2.84 2.13-2.84 1 0 1.49.75 1.49 1.65 0 1-.64 2.5-.97 3.89-.28 1.17.59 2.13 1.74 2.13 2.09 0 3.7-2.2 3.7-5.38 0-2.81-2.02-4.78-4.9-4.78-3.34 0-5.3 2.5-5.3 5.08 0 1.01.39 2.09.87 2.68.1.12.11.22.08.35l-.32 1.33c-.05.2-.17.25-.4.15-1.4-.65-2.28-2.7-2.28-4.35 0-3.7 2.69-7.1 7.75-7.1 4.07 0 7.23 2.9 7.23 6.77 0 4.04-2.55 7.29-6.09 7.29-1.19 0-2.31-.62-2.69-1.35l-.73 2.79c-.27 1.02-.99 2.3-1.47 3.08A12 12 0 1 0 12 0z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.footerLinks}>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <p className="text-[#ACBAC4]/70 text-sm">
            Built by{" "}
            <a
              href="https://www.bishalshrestha52.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="bulgatti-font text-[#E1D9BC] hover:text-[#F0F0DB] transition-colors duration-300"
            >
              Bishal Shrestha
            </a>
          </p>
          <p className={styles.copyright}>© {currentYear} adhyaan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
