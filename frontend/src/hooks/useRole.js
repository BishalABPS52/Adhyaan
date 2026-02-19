'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { useAuth } from './useAuth';

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState('reader');

  useEffect(() => {
    const storedRole = localStorage.getItem('adhyaan_role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const switchRole = (newRole) => {
    if (newRole === 'reader' || newRole === 'author') {
      setRole(newRole);
      localStorage.setItem('adhyaan_role', newRole);
    }
  };

  return (
    <RoleContext.Provider value={{ role, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};
