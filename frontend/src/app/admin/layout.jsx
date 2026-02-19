'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication for dashboard routes
    if (pathname.startsWith('/admin/dashboard')) {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        router.push('/admin');
      }
    }
  }, [pathname, router]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
