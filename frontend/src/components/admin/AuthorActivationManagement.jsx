'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './AuthorActivationManagement.module.css';

import { getApiBaseUrl } from '@/services/api';

const AuthorActivationManagement = () => {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchActivations();
  }, []);

  const fetchActivations = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      // Fetch pending activations
      const pendingResponse = await fetch(`${baseUrl}/admin/requests?status=pending`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setActivations(pendingData.requests || []);
        setStats(prev => ({ ...prev, pending: pendingData.total || 0 }));
      }

      // Fetch all stats
      const allResponse = await fetch(`${baseUrl}/admin/requests`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (allResponse.ok) {
        const allData = await allResponse.json();
        const total = allData.total || 0;
        setStats(prev => ({ ...prev, total }));
      }

    } catch (error) {
      console.error('Error fetching activations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    const baseUrl = getApiBaseUrl();
    setProcessing(requestId);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/admin/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Author activation approved successfully!');
        fetchActivations(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to approve: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving activation:', error);
      alert('Failed to approve activation');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    const baseUrl = getApiBaseUrl();
    setProcessing(requestId);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/admin/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: reason,
        }),
      });

      if (response.ok) {
        alert('Author activation rejected successfully!');
        fetchActivations(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to reject: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting activation:', error);
      alert('Failed to reject activation');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading activations...</p>
      </div>
    );
  }

  if (activations.length === 0) {
    return (
      <Card style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No pending activations at the moment</p>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Author Activation Management</h3>
        <p>Review and manage author activation requests</p>
      </div>

      {/* Statistics */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h4>{stats.total}</h4>
          <p>Total Requests</p>
        </div>
        <div className={styles.statCard}>
          <h4>{stats.pending}</h4>
          <p>Pending Review</p>
        </div>
        <div className={styles.statCard}>
          <h4>{stats.approved || 0}</h4>
          <p>Approved</p>
        </div>
        <div className={styles.statCard}>
          <h4>{stats.rejected || 0}</h4>
          <p>Rejected</p>
        </div>
      </div>

      {/* Pending Activations */}
      <div className={styles.header}>
        <h3>Pending Requests ({activations.length})</h3>
        <p>Requests awaiting your review</p>
      </div>

      <div className={styles.activationList}>
        {activations.map((activation) => (
          <div key={activation.id} className={styles.activationCard}>
            <div className={styles.activationHeader}>
              <div className={styles.userInfo}>
                <h4>{activation.user?.full_name || activation.user?.email}</h4>
                <p className={styles.email}>{activation.user?.email}</p>
                <p className={styles.submitted}>
                  Submitted: {formatDate(activation.created_at)}
                </p>
              </div>
              <div className={styles.status}>
                <span className={`${styles.statusBadge} ${styles.pending}`}>
                  Pending Review
                </span>
              </div>
            </div>

            <div className={styles.activationDetails}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Full Name:</span>
                <span>{activation.full_name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Father's Name:</span>
                <span>{activation.father_name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Mother's Name:</span>
                <span>{activation.mother_name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Date of Birth:</span>
                <span>{activation.date_of_birth}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Document Type:</span>
                <span>{activation.document_type}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Document No:</span>
                <span>{activation.document_no}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Permanent Address:</span>
                <span>{activation.permanent_address}</span>
              </div>
              {activation.temporary_address && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Temporary Address:</span>
                  <span>{activation.temporary_address}</span>
                </div>
              )}
            </div>

            {activation.documents && activation.documents.length > 0 && (
              <div className={styles.documents}>
                <h5>Supporting Documents</h5>
                <div className={styles.documentList}>
                  {activation.documents.map((doc, index) => (
                    <div key={index} className={styles.document}>
                      <span>{doc.file_name || `Document ${index + 1}`}</span>
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewLink}
                      >
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <Button
                variant="success"
                size="small"
                onClick={() => handleApprove(activation.id)}
                disabled={processing === activation.id}
                className={styles.approveBtn}
              >
                {processing === activation.id ? 'Approving...' : 'Approve Author'}
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => handleReject(activation.id)}
                disabled={processing === activation.id}
                className={styles.rejectBtn}
              >
                {processing === activation.id ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorActivationManagement;