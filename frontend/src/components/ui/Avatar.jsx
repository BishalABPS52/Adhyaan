"use client";

import React from "react";
import styles from "./Avatar.module.css";

const Avatar = ({ name, src, size = "medium", className = "" }) => {
  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 45%)`;
  };

  const initials = getInitials(name);
  const backgroundColor = name ? stringToColor(name) : "#1F5FA8";

  const sizeClass = styles[size] || styles.medium;

  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${className}`}
      style={!src ? { backgroundColor } : {}}
    >
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
