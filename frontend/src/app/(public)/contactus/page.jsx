"use client";

import React from "react";
import styles from "./page.module.css";

export default function ContactPage() {
  return (
    <div className={styles.contactPage}>
      <div className="container">
        <header className={styles.header}>
          <h1>Contact Us</h1>
          <p className={styles.subtitle}>Get in touch with the Adhyaan team.</p>
        </header>

        <div className={styles.content}>
          <div className={styles.contactCard}>
            <h2>Developer Information</h2>
            <div className={styles.infoGroup}>
              <label>Developer Name:</label>
              <span>Bishal Shrestha</span>
            </div>

            <div className={styles.infoGroup}>
              <h2>Email Addresses</h2>
              <div className={styles.subInfo}>
                <label>Personal:</label>
                <a href="mailto:bs426808@gmail.com">bs426808@gmail.com</a>
              </div>
              <div className={styles.subInfo}>
                <label>Service:</label>
                <a href="mailto:adhyaan.noreply@gmail.com">
                  adhyaan.noreply@gmail.com
                </a>
              </div>
            </div>

            <div className={styles.infoGroup}>
              <h2>Phone Number</h2>
              <span>9814213742</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
