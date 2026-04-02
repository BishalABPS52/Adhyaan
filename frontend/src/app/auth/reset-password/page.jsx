'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://adhyaan.onrender.com/api/v1";
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCodeDigitChange = (index, value) => {
    if (value.length > 1) return;
    
    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Update formData code
    setFormData({
      ...formData,
      code: newDigits.join('')
    });
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send reset code');
      }

      setMessage('Reset code sent to your email!');
      setStep(2);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid reset code');
      }

      setMessage('Code verified! Please set your new password.');
      setStep(3);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code,
          new_password: formData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }

      setMessage('Password reset successfully! You can now login with your new password.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Reset Code'}
            {step === 3 && 'New Password'}
          </h1>
          <p className={styles.subtitle}>
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Check your email for the 6-digit code'}
            {step === 3 && 'Choose a strong new password'}
          </p>
        </div>

        <form onSubmit={
          step === 1 ? handleSendResetCode :
          step === 2 ? handleVerifyCode :
          handleResetPassword
        } className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.message}>{message}</div>}

          {step === 1 && (
            <div className={styles.inputGroup}>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          )}

          {step === 2 && (
            <div className={styles.codeInput}>
              <label className={styles.codeLabel}>Enter 6-digit code</label>
              <div className={styles.codeDigits}>
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                    className={styles.codeDigit}
                    maxLength="1"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div className={styles.inputGroup}>
                <Input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className={styles.inputGroup}>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Processing...' : 
             step === 1 ? 'Send Reset Code' :
             step === 2 ? 'Verify Code' :
             'Reset Password'}
          </Button>
        </form>

        <div className={styles.footer}>
          <Link href="/auth/login" className={styles.link}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}