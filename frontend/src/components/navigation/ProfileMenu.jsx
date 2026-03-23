"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProfileMenu.module.css";

const ProfileMenu = ({ user, onLogout }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSwitchRole = async (newRole) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adhyaan_token");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://adhyaan.onrender.com/api/v1";
      const response = await fetch(`${apiUrl}/users/switch-role`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Refresh the page to update the role
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to switch role");
      }
    } catch (error) {
      console.error("Error switching role:", error);
      alert("Failed to switch role");
    } finally {
      setLoading(false);
    }
  };

  const currentRole = user?.current_role || user?.role || "studreader";

  return (
    <>
      <div className={styles.profileMenu}>
        <button
          className={styles.profileButton}
          onClick={() => setIsOpen(!isOpen)}
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
          <span className={styles.userName}>
            {user?.username || user?.email}
          </span>
        </button>

        {isOpen && (
          <>
            <div className={styles.overlay} onClick={() => setIsOpen(false)} />
            <div className={styles.dropdown}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {(
                    user?.username?.[0] ||
                    user?.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </div>
                <div>
                  <div className={styles.userNameLarge}>
                    {user?.full_name || user?.username || "User"}
                  </div>
                  <div className={styles.userEmail}>{user?.email}</div>
                  <div className={styles.userRole}>
                    {currentRole === "author"
                      ? "✍️ Author"
                      : "📚 Student Reader"}
                  </div>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Role Switch */}
              <div className={styles.roleSwitch}>
                <span className={styles.roleSwitchLabel}>Switch Mode:</span>
                <div className={styles.roleButtons}>
                  <button
                    className={`${styles.roleBtn} ${currentRole === "studreader" ? styles.active : ""}`}
                    onClick={() => handleSwitchRole("studreader")}
                    disabled={loading || currentRole === "studreader"}
                  >
                    📚 Student Reader
                  </button>
                  <button
                    className={`${styles.roleBtn} ${currentRole === "author" ? styles.active : ""}`}
                    onClick={() => handleSwitchRole("author")}
                    disabled={loading || currentRole === "author"}
                  >
                    ✍️ Author
                  </button>
                </div>
              </div>
              <div className={styles.divider} />

              <button
                className={styles.menuItem}
                onClick={() => {
                  router.push("/profile");
                  setIsOpen(false);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>

              <button
                className={styles.menuItem}
                onClick={() => {
                  router.push("/settings");
                  setIsOpen(false);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M5.636 5.636l4.243 4.243m4.242 4.242l4.243 4.243M1 12h6m6 0h6M5.636 18.364l4.243-4.243m4.242-4.242l4.243-4.243" />
                </svg>
                Settings
              </button>

              <div className={styles.divider} />

              <button
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ProfileMenu;
