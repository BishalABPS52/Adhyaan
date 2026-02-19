'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CourseManagement from '@/components/admin/CourseManagement';
import AuthorActivationManagement from '@/components/admin/AuthorActivationManagement';
import styles from './page.module.css';

import { getApiBaseUrl } from '@/services/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalAuthors: 0,
    pendingActivations: 0,
  });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUserData) {
      router.push('/admin');
      return;
    }

    setAdminUser(JSON.parse(adminUserData));
    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    const baseUrl = getApiBaseUrl();
    const adminToken = localStorage.getItem('adminToken');
    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };

    try {
      // Fetch users
      const usersResponse = await fetch(`${baseUrl}/admin/users`, { headers });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
        setStats(prev => ({ ...prev, totalUsers: usersData.total || usersData.users?.length || 0 }));
      }

      // Fetch books
      const booksResponse = await fetch(`${baseUrl}/books/?limit=100`, { headers });
      if (booksResponse.ok) {
        const booksData = await booksResponse.json();
        setBooks(booksData.books || []);
        setStats(prev => ({ ...prev, totalBooks: booksData.total || booksData.books?.length || 0 }));
      }

      // Fetch pending activations
      const activationsResponse = await fetch(`${baseUrl}/admin/requests?status=pending`, { headers });
      if (activationsResponse.ok) {
        const activationsData = await activationsResponse.json();
        setStats(prev => ({ ...prev, pendingActivations: activationsData.total || 0 }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin');
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const baseUrl = getApiBaseUrl();
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        window.alert('Book deleted successfully');
        fetchAdminData();
      } else {
        window.alert('Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      window.alert('Error deleting book');
    }
  };

  const handleTogglePublishStatus = async (bookId, currentStatus) => {
    try {
      const baseUrl = getApiBaseUrl();
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/admin/books/${bookId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        window.alert(`Book ${currentStatus ? 'unpublished' : 'published'} successfully`);
        fetchAdminData();
      } else {
        window.alert('Failed to update book status');
      }
    } catch (error) {
      console.error('Error updating book status:', error);
      window.alert('Error updating book status');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const baseUrl = getApiBaseUrl();
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.alert(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchAdminData();
      } else {
        window.alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      window.alert('Error updating user status');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="container">
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Admin Header */}
      <div className={styles.adminHeader}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.logoWrapper}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h2>Admin Portal</h2>
                <p>Welcome, {adminUser?.username || 'Admin'}</p>
              </div>
            </div>
            <Button variant="secondary" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <p className={styles.subtitle}>Manage your platform</p>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F5FA8 100%)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3>{stats.totalBooks}</h3>
              <p>Total Books</p>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M12 2v20"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3>{stats.pendingActivations}</h3>
              <p>Pending Activations</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'books' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Books ({books.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'courses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'activations' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('activations')}
          >
            Activations
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              <h2>System Overview</h2>
              <div className={styles.overviewGrid}>
                <Card className={styles.overviewCard}>
                  <h3>Recent Activity</h3>
                  <p>Monitor recent user activities and book uploads</p>
                  <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                      <span className={styles.activityDot}></span>
                      <span>{users.length} registered users</span>
                    </div>
                    <div className={styles.activityItem}>
                      <span className={styles.activityDot}></span>
                      <span>{books.length} books published</span>
                    </div>
                    <div className={styles.activityItem}>
                      <span className={styles.activityDot}></span>
                      <span>{stats.pendingActivations} pending activations</span>
                    </div>
                  </div>
                </Card>
                <Card className={styles.overviewCard}>
                  <h3>Platform Health</h3>
                  <p>All systems operational</p>
                  <div className={styles.healthStatus}>
                    <div className={styles.healthItem}>
                      <span className={styles.healthIndicator} style={{ background: '#10B981' }}></span>
                      <span>API Server: Online</span>
                    </div>
                    <div className={styles.healthItem}>
                      <span className={styles.healthIndicator} style={{ background: '#10B981' }}></span>
                      <span>Database: Connected</span>
                    </div>
                    <div className={styles.healthItem}>
                      <span className={styles.healthIndicator} style={{ background: '#10B981' }}></span>
                      <span>Storage: Available</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className={styles.usersSection}>
              <h2>User Management</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name || user.full_name || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td><span className={styles.badge}>{user.role}</span></td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.is_active ? styles.active : styles.inactive}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            size="small" 
                            variant="secondary"
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className={styles.booksSection}>
              <h2>Book Management</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.author_name || 'Unknown'}</td>
                        <td><span className={styles.badge}>{book.book_type}</span></td>
                        <td>
                          <span className={`${styles.statusBadge} ${book.is_published ? styles.active : styles.inactive}`}>
                            {book.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button 
                              size="small" 
                              variant="secondary"
                              onClick={() => handleTogglePublishStatus(book.id, book.is_published)}
                            >
                              {book.is_published ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button 
                              size="small" 
                              variant="danger"
                              onClick={() => handleDeleteBook(book.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className={styles.coursesSection}>
              <CourseManagement />
            </div>
          )}

          {activeTab === 'activations' && (
            <div className={styles.activationsSection}>
              <AuthorActivationManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
