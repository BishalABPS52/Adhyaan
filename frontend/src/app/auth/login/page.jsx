"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

export default function LoginPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://adhyaan.onrender.com/api/v1";
  const router = useRouter();
  const { login, register } = useAuth();
  const { switchRole } = useRole();
  const [isLogin, setIsLogin] = useState(true);
  const [signUpStep, setSignUpStep] = useState(1); // Track sign up steps
  const [selectedRole, setSelectedRole] = useState("reader");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
    dob: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const sendVerificationCode = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/auth/send-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            full_name: formData.full_name,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send verification code");
      }

      return true;
    } catch (err) {
      console.error("Error sending verification code:", err);
      throw err;
    }
  };

  const verifyCode = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/auth/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            code: formData.verificationCode,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid verification code");
      }

      return true;
    } catch (err) {
      console.error("Error verifying code:", err);
      throw err;
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${apiBaseUrl}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            full_name: formData.full_name,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to resend code");
      }

      alert("Verification code resent successfully!");
    } catch (err) {
      setError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login: backend expects { email, password }
        const userData = await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        // Use role from backend response
        const userRole = userData.role === "author" ? "author" : "reader";
        switchRole(userRole);

        // Redirect based on role
        if (userRole === "author") {
          router.push("/dashboard");
        } else {
          router.push("/home");
        }
      } else {
        // Handle multi-step sign up
        if (signUpStep === 1) {
          // Validate step 1
          if (!formData.full_name || !formData.dob || !formData.email) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
          }

          // Check if user is at least 10 years old
          const birthDate = new Date(formData.dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          if (age < 10) {
            setError("You must be at least 10 years old to sign up");
            setLoading(false);
            return;
          }

          // Check if email already exists
          try {
            const checkResponse = await fetch(
              `${apiBaseUrl}/auth/check-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: formData.email.trim() }),
              },
            );

            if (checkResponse.ok) {
              const data = await checkResponse.json();
              if (data.exists) {
                setError(
                  "This email is already registered. Please use a different email or login.",
                );
                setLoading(false);
                return;
              }
            }
          } catch (err) {
            console.log("Email check skipped:", err);
            // Continue even if check fails - let backend handle it
          }

          setSignUpStep(2);
          setLoading(false);
          return;
        } else if (signUpStep === 2) {
          // Validate step 2
          if (!formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
          }
          if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
          }
          // Check password contains at least one letter and one digit
          const hasLetter = /[a-zA-Z]/.test(formData.password);
          const hasDigit = /\d/.test(formData.password);
          if (!hasLetter || !hasDigit) {
            setError("Password must contain at least one letter and one digit");
            setLoading(false);
            return;
          }

          // Send verification code
          try {
            await sendVerificationCode();
            setCodeSent(true);
            setSignUpStep(3);
          } catch (err) {
            setError(err.message || "Failed to send verification code");
          }

          setLoading(false);
          return;
        } else if (signUpStep === 3) {
          // Validate step 3 and complete registration
          if (!formData.verificationCode) {
            setError("Please enter the verification code");
            setLoading(false);
            return;
          }

          if (formData.verificationCode.length !== 6) {
            setError("Verification code must be 6 digits");
            setLoading(false);
            return;
          }

          // Verify the code
          try {
            await verifyCode();
          } catch (err) {
            setError(err.message || "Invalid or expired verification code");
            setLoading(false);
            return;
          }

          // Generate username from email and sanitize (alphanumeric, underscores, hyphens)
          // Backend requires min 3 chars and no dots
          let generatedUsername = formData.email
            .split("@")[0]
            .replace(/\./g, "_") // Replace dots with underscores
            .replace(/[^a-zA-Z0-9_-]/g, ""); // Remove other invalid chars

          if (generatedUsername.length < 3) {
            generatedUsername = generatedUsername.padEnd(3, "0");
          }

          // Registration: backend expects { email, username, password, full_name, role }
          const userData = await register({
            email: formData.email.trim(),
            username: generatedUsername.toLowerCase(),
            password: formData.password,
            full_name: formData.full_name,
            role: selectedRole === "author" ? "author" : "studreader",
          });

          // Use role from backend response
          const userRole = userData.role === "author" ? "author" : "reader";
          switchRole(userRole);

          // Redirect based on role
          if (userRole === "author") {
            router.push("/dashboard");
          } else {
            router.push("/home");
          }
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    setError("");
    if (signUpStep > 1) {
      setSignUpStep(signUpStep - 1);
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setSignUpStep(1);
    setError("");
    setCodeSent(false);
    setCodeDigits(["", "", "", "", "", ""]);
    setFormData({
      email: "",
      password: "",
      username: "",
      full_name: "",
      dob: "",
      confirmPassword: "",
      verificationCode: "",
    });
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        {/* Left Side - Welcome Panel */}
        <div className={styles.welcomePanel}>
          <div className={styles.welcomeContent}>
            <h1>
              {isLogin
                ? "Welcome Back to Adhyaan"
                : "Start Your Learning Journey with Adhyaan"}
            </h1>
            <p>
              {isLogin
                ? "Pick up where you left off, your books, courses, and study spaces are waiting."
                : "Read course materials, explore independent books, and grow at your own pace."}
            </p>
            <p style={{ marginTop: "20px", fontSize: "22px" }}>
              {isLogin ? "New here?" : "Already a member?"}
            </p>
            <button className={styles.switchButton} onClick={handleSwitchMode}>
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className={styles.formPanel}>
          <div className={styles.formContent}>
            <h2>
              {isLogin
                ? "Login"
                : `Sign Up ${!isLogin ? `(Step ${signUpStep}/3)` : ""}`}
            </h2>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              {error && (
                <div
                  style={{
                    padding: "10px",
                    marginBottom: "15px",
                    backgroundColor: "#fee",
                    border: "1px solid #fcc",
                    borderRadius: "4px",
                    color: "#c33",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Login Form */}
              {isLogin && (
                <>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    }
                    required
                  />

                  <Input
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    }
                    required
                  />
                </>
              )}

              {/* Sign Up Step 1: Name, DOB, Email */}
              {!isLogin && signUpStep === 1 && (
                <>
                  <Input
                    placeholder="Full Name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    icon={
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
                    }
                    required
                  />

                  <Input
                    placeholder="Date of Birth"
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    }
                    required
                  />

                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    }
                    required
                  />
                </>
              )}

              {/* Sign Up Step 2: Password and Confirm Password */}
              {!isLogin && signUpStep === 2 && (
                <>
                  <div
                    style={{
                      marginBottom: "15px",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    <strong>Email:</strong> {formData.email}
                  </div>

                  <Input
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    }
                    required
                  />
                  <div
                    style={{
                      marginTop: "-10px",
                      marginBottom: "15px",
                      color: "#888",
                      fontSize: "12px",
                    }}
                  >
                    Password must be 8 characters consisting atleast 1 digit and
                    1 alphabet
                  </div>

                  <Input
                    placeholder="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    }
                    required
                  />
                </>
              )}

              {/* Sign Up Step 3: Verification Code */}
              {!isLogin && signUpStep === 3 && (
                <>
                  <div
                    style={{
                      marginBottom: "15px",
                      color: "#666",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    <p>We've sent a verification code to:</p>
                    <strong style={{ color: "#333" }}>{formData.email}</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`code-input-${index}`}
                        type="text"
                        maxLength={1}
                        value={codeDigits[index]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 1) {
                            const newDigits = [...codeDigits];
                            newDigits[index] = value;
                            setCodeDigits(newDigits);
                            setFormData({
                              ...formData,
                              verificationCode: newDigits.join(""),
                            });

                            // Auto-focus next input
                            if (value && index < 5) {
                              document
                                .getElementById(`code-input-${index + 1}`)
                                ?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle backspace
                          if (
                            e.key === "Backspace" &&
                            !codeDigits[index] &&
                            index > 0
                          ) {
                            document
                              .getElementById(`code-input-${index - 1}`)
                              ?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedData = e.clipboardData
                            .getData("text")
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          const newDigits = [...codeDigits];
                          for (let i = 0; i < pastedData.length && i < 6; i++) {
                            newDigits[i] = pastedData[i];
                          }
                          setCodeDigits(newDigits);
                          setFormData({
                            ...formData,
                            verificationCode: newDigits.join(""),
                          });
                          // Focus the next empty input or the last one
                          const nextEmptyIndex = newDigits.findIndex((d) => !d);
                          const focusIndex =
                            nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
                          document
                            .getElementById(`code-input-${focusIndex}`)
                            ?.focus();
                        }}
                        style={{
                          width: "50px",
                          height: "60px",
                          textAlign: "center",
                          fontSize: "24px",
                          fontWeight: "bold",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          transition: "border-color 0.3s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#4A90E2";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#ddd";
                        }}
                        required
                      />
                    ))}
                  </div>

                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4A90E2",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: "14px",
                      }}
                      onClick={resendCode}
                      disabled={loading}
                    >
                      {loading ? "Resending..." : "Resend Code"}
                    </button>
                  </div>
                </>
              )}

              {isLogin && (
                <div className={styles.forgotPassword}>
                  <Link href="/auth/reset-password">Forgot Password?</Link>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                {!isLogin && signUpStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={handleBackStep}
                  >
                    Back
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading
                    ? isLogin
                      ? "Signing in..."
                      : signUpStep === 3
                        ? "Verifying..."
                        : "Next..."
                    : isLogin
                      ? "Login"
                      : signUpStep === 3
                        ? "Verify & Sign Up"
                        : "Next"}
                </Button>
              </div>
            </form>

            {isLogin && (
              <>
                <div className={styles.divider}>
                  <span>or login with social platforms</span>
                </div>

                <div className={styles.socialButtons}>
                  <button
                    className={styles.socialBtn}
                    aria-label="Login with Google"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </button>
                  <button
                    className={styles.socialBtn}
                    aria-label="Login with Facebook"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    className={styles.socialBtn}
                    aria-label="Login with GitHub"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </button>
                  <button
                    className={styles.socialBtn}
                    aria-label="Login with LinkedIn"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
