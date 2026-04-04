'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/hooks/useAuth';
import { RoleProvider } from '@/hooks/useRole';
import { ThemeProvider } from '@/hooks/useTheme';
import GoogleTagManager from '@/components/GoogleTagManager';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/footer/Footer';
import '@/styles/globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Crimson+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
        <title>Adhyaan – Study & Learn</title>
        <meta name="description" content="Your Digital Learning Companion – Study, Read, and Grow" />
      </head>
      <body>
        <GoogleTagManager />
        <ThemeProvider>
          <AuthProvider>
            <RoleProvider>
              {!isAdminRoute && <Navbar />}
              <main>{children}</main>
              {!isAdminRoute && <Footer />}
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
