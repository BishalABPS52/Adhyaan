"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://adhyaan.up.railway.app/api/v1";
    const token =
      localStorage.getItem("adhyaan_token") || localStorage.getItem("token");

    try {
      const response = await fetch(`${baseUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading profile...</div>;

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className={styles.profileGrid}>
          <Card className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.full_name}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {profile?.full_name?.charAt(0) ||
                      profile?.username?.charAt(0) ||
                      "U"}
                  </div>
                )}
              </div>
              <h2>{profile?.full_name || "Bhairav Aryal"}</h2>
              <p className={styles.roleBadge}>{profile?.role?.toUpperCase()}</p>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoGroup}>
                <label>Username</label>
                <p>{profile?.username}</p>
              </div>
              <div className={styles.infoGroup}>
                <label>Email Address</label>
                <p>{profile?.email}</p>
              </div>
              <div className={styles.infoGroup}>
                <label>Member Since</label>
                <p>
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "Feb 2026"}
                </p>
              </div>
              {profile?.bio && (
                <div className={styles.infoGroup}>
                  <label>Bio</label>
                  <p>{profile.bio}</p>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => {}}>
                Edit Profile
              </Button>
              <Button variant="danger" onClick={logout}>
                Logout
              </Button>
            </div>
          </Card>

          <div className={styles.statsSection}>
            <Card className={styles.statsCard}>
              <h3>Account Status</h3>
              <div className={styles.statusItem}>
                <span>Active</span>
                <span className={styles.statusCheck}>✓</span>
              </div>
              <div className={styles.statusItem}>
                <span>Verified</span>
                <span className={styles.statusCheck}>✓</span>
              </div>
              {profile?.role === "author" && (
                <div className={styles.statusItem}>
                  <span>Author Approved</span>
                  <span className={styles.statusCheck}>✓</span>
                </div>
              )}
            </Card>

            <Card className={styles.statsCard}>
              <h3>Security</h3>
              <p>Password last changed: 2 months ago</p>
              <Button
                variant="outline"
                size="small"
                style={{ marginTop: "1rem" }}
              >
                Change Password
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
