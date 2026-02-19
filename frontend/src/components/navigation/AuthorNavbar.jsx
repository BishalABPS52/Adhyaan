"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import ThemeToggle from "../theme/ThemeToggle";
import styles from "./Navbar.module.css";

import BookCount from "./BookCount";

const AuthorNavbar = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { switchRole } = useRole();
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
        <Link href="/dashboard" className={styles.logo}>
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
          <Link href="/dashboard" className={styles.navLink}>
            Home
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

          <BookCount />

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
                <button
                  className={styles.dropdownItem}
                  onClick={() => handleRoleSwitch("reader")}
                >
                  Switch to Reader
                </button>
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
            href="/dashboard"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Home
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
            href="/help"
            className={styles.mobileLink}
            onClick={toggleMobileMenu}
          >
            Help
          </Link>
          <button
            className={styles.mobileLink}
            onClick={() => {
              handleRoleSwitch("reader");
              toggleMobileMenu();
            }}
          >
            Switch to Reader
          </button>
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

export default AuthorNavbar;
