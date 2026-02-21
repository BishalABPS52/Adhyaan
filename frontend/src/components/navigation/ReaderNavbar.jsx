"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import ThemeToggle from "../theme/ThemeToggle";
import styles from "./Navbar.module.css";


const ReaderNavbar = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { switchRole } = useRole();

  const ALLOWED_AUTHOR_EMAILS = [
    "bs426808@gmail.com",
    "abps512bishal@gmail.com",
    "aayushma5206@gmail.com",
  ];

  const canSwitchToAuthor = user && ALLOWED_AUTHOR_EMAILS.includes(user.email);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleProfileDropdown = () =>
    setProfileDropdownOpen(!profileDropdownOpen);

  const handleRoleSwitch = (newRole) => {
    switchRole(newRole);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    if (newRole === "author") {
      router.push("/dashboard");
    } else {
      router.push("/home");
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/home" className={styles.logo}>
          <Image
            src="/logo/adhyaan.png"
            alt="Adhyaan Logo"
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
            priority
          />
          <span className={styles.logoText}>Adhyaan</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="/home" className={styles.navLink}>
            Home
          </Link>
          <Link href="/books" className={styles.navLink}>
            Books
          </Link>
          <Link href="/search" className={styles.navLink}>
            Search
          </Link>
          <Link href="/under-development" className={styles.navLink}>
            Study Room
          </Link>
          <Link href="/under-development" className={styles.navLink}>
            Community
          </Link>
          <Link href="/help" className={styles.navLink}>
            Help
          </Link>
        </div>

        <div className={styles.navActions}>
          <ThemeToggle />


          <div className={styles.profileDropdown}>
            <button
              className={styles.profileButton}
              onClick={toggleProfileDropdown}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {profileDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link href="/profile" className={styles.dropdownItem}>
                  Profile
                </Link>
                {canSwitchToAuthor && (
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleRoleSwitch("author")}
                  >
                    Switch to Author
                  </button>
                )}
                <div className={styles.dropdownDivider}></div>
                <button className={styles.dropdownItem} onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link
            href="/home"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Home
          </Link>
          <Link
            href="/search"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Search
          </Link>
          <Link
            href="/under-development"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Study Room
          </Link>
          <Link
            href="/under-development"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Community
          </Link>
          <Link
            href="/profile"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Profile
          </Link>
          <Link
            href="/help"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Help
          </Link>
          {canSwitchToAuthor && (
            <button
              className={styles.mobileLink}
              onClick={() => {
                handleRoleSwitch("author");
                toggleMobileMenu();
              }}
            >
              Switch to Author
            </button>
          )}
          <button
            className={styles.mobileLink}
            onClick={() => {
              logout();
              toggleMobileMenu();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default ReaderNavbar;
