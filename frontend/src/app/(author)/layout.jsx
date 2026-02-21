"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Author layout - allows all authenticated users to access author features
export default function AuthorLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        const ALLOWED_AUTHOR_EMAILS = [
          "bs426808@gmail.com",
          "abps512bishal@gmail.com",
          "aayushma5206@gmail.com",
          "shswtsharma@gmail.com",
        ];
        if (!ALLOWED_AUTHOR_EMAILS.includes(user.email)) {
          router.push("/home");
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return children;
}
