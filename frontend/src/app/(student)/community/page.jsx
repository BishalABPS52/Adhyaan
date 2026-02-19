'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function Community() {
  const [question, setQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'General'];

  const posts = [
    { 
      id: 1, 
      title: 'How to solve quadratic equations?', 
      author: 'Student A', 
      category: 'Mathematics', 
      time: '2 hours ago', 
      answers: 5, 
      views: 123,
      preview: 'I am having trouble understanding the quadratic formula...'
    },
    { 
      id: 2, 
      title: 'Explain Newton\'s Third Law', 
      author: 'Student B', 
      category: 'Physics', 
      time: '5 hours ago', 
      answers: 8, 
      views: 245,
      preview: 'Can someone explain Newton\'s third law with real examples?'
    },
    { 
      id: 3, 
      title: 'Organic Chemistry Reactions', 
      author: 'Student C', 
      category: 'Chemistry', 
      time: '1 day ago', 
      answers: 12, 
      views: 456,
      preview: 'What are the main types of organic reactions?'
    },
    { 
      id: 4, 
      title: 'Cell Division Process', 
      author: 'Student D', 
      category: 'Biology', 
      time: '2 days ago', 
      answers: 6, 
      views: 189,
      preview: 'Need help understanding mitosis and meiosis differences...'
    },
  ];

  const filteredPosts = posts.filter(post => 
    selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className={styles.container}>
      <div className="container">
        <h1 className={styles.pageTitle}>Community</h1>
        <p className={styles.pageSubtitle}>Ask questions and help fellow students</p>

        {/* Ask Question Section */}
        <Card className={styles.askCard}>
          <h2 className={styles.askTitle}>Ask a Question</h2>
          <textarea
            placeholder="What would you like to ask the community?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className={styles.textarea}
            rows={4}
          />
          <div className={styles.askActions}>
            <select className={styles.categorySelect}>
              <option value="">Select Category</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
            <Button variant="primary">Post Question</Button>
          </div>
        </Card>

        {/* Filter Categories */}
        <div className={styles.filters}>
          <h3 className={styles.filterTitle}>Filter by Category:</h3>
          <div className={styles.categoryButtons}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${selectedCategory === cat.toLowerCase() ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Questions Feed */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Questions</h2>
          <div className={styles.postsGrid}>
            {filteredPosts.map(post => (
              <Card key={post.id} hover className={styles.postCard}>
                <div className={styles.postHeader}>
                  <span className={styles.categoryBadge}>{post.category}</span>
                  <span className={styles.time}>{post.time}</span>
                </div>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postPreview}>{post.preview}</p>
                <div className={styles.postMeta}>
                  <div className={styles.author}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {post.author}
                  </div>
                  <div className={styles.stats}>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {post.answers} answers
                    </span>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {post.views} views
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="small" style={{ width: '100%', marginTop: '1rem' }}>
                  View Answers
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
