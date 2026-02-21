'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

export default function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'Click on the "Sign In / Sign Up" button in the top navigation bar. Fill in your details including name, email, and password. After registration, you can choose your role as Student/Reader or Author.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'What is the difference between Reader Section and Student Section?',
      answer: 'The Reader Section contains indie books across various genres for leisure reading, while the Student Section provides curriculum-based study materials organized by educational boards, levels, and subjects for academic learning.'
    },
    {
      id: 3,
      category: 'Account',
      question: 'Can I switch between Student and Author roles?',
      answer: 'Yes! You can switch between Student/Reader and Author roles anytime from your dashboard without logging out. Just click on your profile dropdown and select "Switch to Author" or "Switch to Student/Reader" but currently this feature isn'/'t availaible.'
    },
    {
      id: 4,
      category: 'Books',
      question: 'How do I search for books?',
      answer: 'Use the search options at the top of the page for desktop and Click Options for mobile or navigate to Reader Section or Student Section. You can filter books by genre, popularity, publication year (Reader Section) or by level, class, and board (Student Section).'
    },
    {
      id: 5,
      category: 'Books',
      question: 'Can I download books for offline reading?',
      answer: 'Currently, books are available for online reading only. Offline download feature will be available in future updates. Stay tuned!'
    },
    {
      id: 6,
      category: 'Study Rooms',
      question: 'What are Study Rooms?',
      answer: 'Study Rooms are collaborative learning spaces where students can join live study sessions, share materials, and discuss topics with peers. This feature is currently under development and will be available soon.'
    },
    {
      id: 7,
      category: 'Study Rooms',
      question: 'How do I join a Study Room?',
      answer: 'Once the feature is live, you will be able to join study rooms using unique room codes provided by authors or educators. Stay tuned for updates!'
    },
    {
      id: 8,
      category: 'Community',
      question: 'How does the Community section work?',
      answer: 'The Community section is a Q&A platform where you can ask questions, provide answers, and help fellow students. Post your questions with relevant categories, and other users can respond with their insights and solutions.This feature is currently under development and will be available soon.'
    },
    {
      id: 9,
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password?" on the login page. Enter your registered email address, and you will receive a password reset link. Follow the instructions in the email to set a new password.'
    },
    {
      id: 10,
      category: 'Technical',
      question: 'The website is not loading properly. What should I do?',
      answer: 'Try clearing your browser cache and cookies, or use a different browser. Ensure you have a stable internet connection. If the problem persists, contact our support team.'
    },
    {
      id: 11,
      category: 'Books',
      question: 'How do I bookmark my favorite books?',
      answer: 'When viewing a book, click on the bookmark icon to save it to your library. You can access all your bookmarked books from your dashboard under "Saved Books".'
    },
    {
      id: 12,
      category: 'Privacy',
      question: 'Is my data secure on Adhyaan?',
      answer: 'Yes, we take data security seriously. All user data is stored securely. We do not share your personal information with third parties without your consent. Read our Privacy Policy for more details.'
    },
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Help & Support</h1>
          <p className={styles.pageSubtitle}>Find answers to frequently asked questions</p>
        </div>

        {/* Search Bar */}
        <Card className={styles.searchCard}>
          <div className={styles.searchBar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </Card>

        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {filteredFaqs.map(faq => (
              <Card key={faq.id} className={styles.faqCard}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <div className={styles.questionContent}>
                    <span className={styles.categoryTag}>{faq.category}</span>
                    <h3>{faq.question}</h3>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`${styles.icon} ${openFaq === faq.id ? styles.rotate : ''}`}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                {openFaq === faq.id && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <Card className={styles.supportCard}>
          <h2 className={styles.supportTitle}>Still Need Help?</h2>
          <p className={styles.supportText}>
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <div className={styles.supportOptions}>
            <div className={styles.supportOption}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="m22 6-10 7L2 6"/>
              </svg>
              <div>
                <h4>Email Support</h4>
                <p>support@adhyaan.com</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
