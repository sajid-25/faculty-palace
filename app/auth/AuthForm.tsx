"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth, UserRole, DEMO_USERS, isValidEmail } from "../context/AuthContext";

type AuthFormProps = {
  mode: "login" | "register";
};

const DEMO_PASSWORD = "AssessIQDemo123!";

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { user, roleConfig, isLoggedIn, login, register: registerUser, logout } = useAuth();
  const isRegistering = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError && isValidEmail(val)) {
      setEmailError("");
    }
  };

  const handleEmailBlur = () => {
    if (email.trim() && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address (e.g. you@institution.edu).");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address (e.g. you@institution.edu).");
      return;
    }

    setEmailError("");

    setFormError("");
    setIsSubmitting(true);
    try {
      if (isRegistering) await registerUser(name, email.trim(), password, "faculty");
      else await login(email.trim(), password);
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleDemoLogin = async (role: UserRole) => {
    const demo = DEMO_USERS[role];
    setFormError("");
    setIsSubmitting(true);
    try {
      await login(demo.email, DEMO_PASSWORD);
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Demo account is unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-atmosphere auth-atmosphere-left" />
      <div className="auth-atmosphere auth-atmosphere-right" />
      <header className="auth-header">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark">A</span>
          <span>assess<span>iq</span></span>
        </Link>
        <span className="auth-header-note">Role-Based Assessment Intelligence</span>
      </header>

      <section className="auth-layout">
        <div className="auth-story">
          <p className="eyebrow">ACADEMIC ROLE-BASED WORKSPACE</p>
          <h1>Make every question<br /><em>count.</em></h1>
          <p className="auth-story-copy">
            AssessIQ tailors permissions and workflows specifically for Course Instructors, Department Heads, and External Examiners.
          </p>

          <div className="auth-role-summary-list">
            <div className="role-bullet">
              <span className="bullet-icon admin">🏛</span>
              <div>
                <strong>Department Head / Admin</strong>
                <small>Full governance, exam approval for printing, and institutional bank management.</small>
              </div>
            </div>
            <div className="role-bullet">
              <span className="bullet-icon faculty">👨‍🏫</span>
              <div>
                <strong>Course Instructor</strong>
                <small>Upload syllabus & draft exams, launch AI audits, and view improvement suggestions.</small>
              </div>
            </div>
            <div className="role-bullet">
              <span className="bullet-icon reviewer">🔍</span>
              <div>
                <strong>External Examiner</strong>
                <small>Independent quality moderation, Bloom distribution inspection, and feedback review.</small>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          {isLoggedIn && !submitted ? (
            <div className="auth-already-in">
              <span className="auth-kicker">ACTIVE SESSION</span>
              <h2>You are signed in</h2>
              <div className="current-user-badge">
                <span className="avatar-large">{user?.initials || "FA"}</span>
                <div>
                  <strong>{user?.name}</strong>
                  <small>{user?.email}</small>
                  <span className={`role-pill ${roleConfig?.badgeClass || "badge-faculty"}`}>
                    {roleConfig?.label || "Faculty"}
                  </span>
                </div>
              </div>

              <div className="auth-session-scope">
                <small>Your role is fixed for this session.</small>
                <span>Sign out to use a different account.</span>
              </div>

              <div className="auth-already-actions">
                <Link className="primary-button full-width" href="/dashboard">
                  <span>Enter {roleConfig?.label} Workspace</span>
                  <span>→</span>
                </Link>
                <button className="outline-button full-width" type="button" onClick={logout}>
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-card-heading">
                <span className="auth-kicker">{isRegistering ? "GET STARTED" : "WELCOME BACK"}</span>
                <h2>{isRegistering ? "Create your faculty account" : "Sign in to AssessIQ"}</h2>
                <p>
                  {isRegistering
                    ? "Select your academic role to unlock tailored assessment permissions."
                    : "Choose a role demo persona or sign in with your institutional email."}
                </p>
              </div>

              <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
                <Link className={!isRegistering ? "selected" : ""} href="/login">Sign in</Link>
                <Link className={isRegistering ? "selected" : ""} href="/register">Create account</Link>
              </div>

              {submitted ? (
                <div className="auth-success" role="status">
                  <span>✓</span>
                  <strong>{isRegistering ? "Your account is created!" : "Signed in successfully!"}</strong>
                  <small>Preparing your tailored workspace...</small>
                  <Link href="/dashboard">Entering dashboard <b>→</b></Link>
                </div>
              ) : (
                <>
                  {/* Multi-Role Instant Demo Buttons */}
                  {!isRegistering && (
                    <div className="role-demo-buttons-wrap">
                      <span className="demo-header-label">⚡ 1-CLICK DEMO SIGN IN BY ROLE</span>
                      <div className="role-demo-grid">
                        <button
                          type="button"
                          className="role-demo-card admin"
                          onClick={() => handleRoleDemoLogin("admin")}
                        >
                          <span className="card-badge">🏛 Department Head</span>
                          <strong>Dr. Sarah Rahman</strong>
                          <small>Approval powers · Audit all courses</small>
                        </button>

                        <button
                          type="button"
                          className="role-demo-card faculty"
                          onClick={() => handleRoleDemoLogin("faculty")}
                        >
                          <span className="card-badge">👨‍🏫 Course Instructor</span>
                          <strong>Arjun Mehta</strong>
                          <small>Upload exams · Run AI audits</small>
                        </button>

                        <button
                          type="button"
                          className="role-demo-card reviewer"
                          onClick={() => handleRoleDemoLogin("reviewer")}
                        >
                          <span className="card-badge">🔍 External Examiner</span>
                          <strong>Prof. David Chen</strong>
                          <small>Moderation review · Read-only</small>
                        </button>
                      </div>
                      <div className="auth-divider"><span>or with credentials</span></div>
                    </div>
                  )}

                  <form className="auth-form" onSubmit={handleSubmit}>
                    {isRegistering && (
                      <>
                        <label>
                          Full name
                          <input
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Dr. Sarah Rahman"
                            required
                          />
                        </label>

                        <p className="registration-role-note">New accounts start as Course Instructor accounts. Department Head and External Examiner accounts are provisioned by an administrator.</p>
                      </>
                    )}

                    <label>
                      Institutional email
                      <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onBlur={handleEmailBlur}
                        placeholder="you@institution.edu"
                        className={emailError ? "input-error" : ""}
                        required
                      />
                      {emailError && (
                        <span className="field-error-msg" role="alert">
                          ⚠ {emailError}
                        </span>
                      )}
                    </label>

                    <label>
                      Password{" "}
                      <span className="label-hint">
                        {isRegistering ? "At least 6 characters" : <Link href="/register">Forgot password?</Link>}
                      </span>
                      <span className="password-field">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </span>
                    </label>

                    {isRegistering ? (
                      <label className="check-row">
                        <input type="checkbox" required />
                        <span>I agree to academic compliance and terms of service.</span>
                      </label>
                    ) : (
                      <label className="check-row">
                        <input type="checkbox" defaultChecked />
                        <span>Keep me signed in on this device</span>
                      </label>
                    )}

                    {formError && <span className="field-error-msg" role="alert">⚠ {formError}</span>}
                    <button className="auth-submit" type="submit" disabled={isSubmitting}>
                      {isRegistering
                        ? "Create Course Instructor Account"
                        : "Sign in to Workspace"}
                      <span>→</span>
                    </button>
                  </form>
                </>
              )}

              <div className="auth-divider"><span>or single sign-on</span></div>
              <button
                className="google-button"
                type="button"
                onClick={() => handleRoleDemoLogin("faculty")}
                disabled={isSubmitting || submitted}
              >
                <span className="google-g">G</span> University Single Sign-On (SSO)
              </button>
              <p className="auth-switch-copy">
                {isRegistering ? "Already have an account?" : "Need a new account?"}{" "}
                <Link href={isRegistering ? "/login" : "/register"}>
                  {isRegistering ? "Sign in" : "Register with your role"}
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
      <footer className="auth-footer">
        <span>© 2026 AssessIQ</span>
        <span>Role-Based Academic Assessment Quality Assurance</span>
      </footer>
    </main>
  );
}