'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import PublicNavbar from './PublicNavbar';
import ReaderNavbar from './ReaderNavbar';
import AuthorNavbar from './AuthorNavbar';

const Navbar = () => {
  const { user } = useAuth();
  const { role } = useRole();

  if (!user) {
    return <PublicNavbar />;
  }

  if (role === 'author') {
    return <AuthorNavbar />;
  }

  return <ReaderNavbar />;
};

export default Navbar;