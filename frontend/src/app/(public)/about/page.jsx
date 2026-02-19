"use client";

import React from "react";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className="container">
        <header className={styles.header}>
          <h1>About Adhyaan</h1>
          <p className={styles.subtitle}>
            Empowering minds through digital learning and collaboration.
          </p>
        </header>

        <section className={styles.section}>
          <div className={styles.content}>
            <h2>Our Mission</h2>
            <p>
              Adhyaan is a comprehensive digital learning platform designed to
              bridge the gap between traditional education and the digital
              future. We believe that knowledge should be accessible,
              interactive, and collaborative.
            </p>
            <p>
              Whether you're a student looking for board-specific study
              materials or an indie author sharing unique insights, Adhyaan
              provides the tools you need to succeed.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>For Readers</h3>
              <p>
                Access a vast library of indie books and academic materials
                tailored to your curriculum. Join study rooms and learn at your
                own pace.
              </p>
            </div>
            <div className={styles.card}>
              <h3>For Authors</h3>
              <p>
                Publish your own study materials, reach a global audience of
                learners, and build your community through interactive study
                rooms.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
