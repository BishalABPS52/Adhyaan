'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session and validate token
    const validateSession = async () => {
      const storedUser = localStorage.getItem('adhyaan_user');
      const token = localStorage.getItem('adhyaan_token');
      
      if (storedUser && token) {
        try {
          // Validate token with backend
          await authService.getCurrentUser();
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Token validation failed:', e);
          // Token is invalid, clear stored data
          localStorage.removeItem('adhyaan_user');
          localStorage.removeItem('adhyaan_token');
          localStorage.removeItem('adhyaan_role');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      // Backend returns { user, token }
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('adhyaan_role', userData.role);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      // Backend returns { user, token }
      const newUser = response.user;
      setUser(newUser);
      localStorage.setItem('adhyaan_role', newUser.role);
      return newUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
