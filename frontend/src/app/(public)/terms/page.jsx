"use client";

import React from "react";
import styles from "./page.module.css";

export default function TermsPage() {
  return (
    <div className={styles.termsPage}>
      <div className="container">
        <header className={styles.header}>
          <h1>Terms of Service</h1>
          <p className={styles.subtitle}>
            Please read these terms carefully before using our service.
          </p>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Adhyaan, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. User Content</h2>
            <p>
              Authors are responsible for the content they publish. Adhyaan
              reserves the right to remove any content that violates our
              community guidelines or copyright laws.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please refer to our Privacy
              Policy to understand how we collect and use your personal
              information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Disclaimer</h2>
            <p>
              The materials on Adhyaan are provided on an 'as is' basis. Adhyaan
              makes no warranties, expressed or implied, regarding the accuracy
              or reliability of the materials.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
