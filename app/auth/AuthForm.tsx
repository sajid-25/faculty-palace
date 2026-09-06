"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { user, isLoggedIn, login, register: registerUser, logout } = useAuth();
  const isRegistering = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRegistering) {
      registerUser(name, email);
    } else {
      login(email);
    }
    setSubmitted(true);
    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  const handleDemoLogin = () => {
    login("arjun.mehta@institution.edu", "Arjun Mehta", "Faculty Admin");
    router.push("/");
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
        <span className="auth-header-note">Academic assessment intelligence</span>
      </header>

      <section className="auth-layout">
        <div className="auth-story">
          <p className="eyebrow">A CLEARER WAY TO ASSESS</p>
          <h1>Make every question<br /><em>count.</em></h1>
          <p className="auth-story-copy">AssessIQ helps faculty turn draft exams into balanced, outcome-aligned assessments with less guesswork.</p>
          <div className="auth-proof">
            <span className="proof-avatars"><i>AM</i><i>SK</i><i>RJ</i></span>
            <span><strong>Trusted by thoughtful educators</strong><small>Build better assessments, together.</small></span>
          </div>
        </div>

        <div className="auth-card">
          {isLoggedIn && !submitted ? (
            <div className="auth-already-in">
              <span className="auth-kicker">ACTIVE SESSION</span>
              <h2>You are already signed in</h2>
              <div className="current-user-badge">
                <span className="avatar-large">{user?.initials || "FA"}</span>
                <div>
                  <strong>{user?.name}</strong>
                  <small>{user?.email} · {user?.role}</small>
                </div>
              </div>
              <div className="auth-already-actions">
                <Link className="primary-button full-width" href="/">
                  <span>Go to Workspace</span>
                  <span>→</span>
                </Link>
                <button className="outline-button full-width" type="button" onClick={logout}>
                  Sign out of this session
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-card-heading">
                <span className="auth-kicker">{isRegistering ? "GET STARTED" : "WELCOME BACK"}</span>
                <h2>{isRegistering ? "Create your account" : "Sign in to AssessIQ"}</h2>
                <p>{isRegistering ? "Set up your faculty workspace in a minute." : "Continue where your assessment work left off."}</p>
              </div>

              <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
                <Link className={!isRegistering ? "selected" : ""} href="/login">Sign in</Link>
                <Link className={isRegistering ? "selected" : ""} href="/register">Create account</Link>
              </div>

              {submitted ? (
                <div className="auth-success" role="status">
                  <span>✓</span>
                  <strong>{isRegistering ? "Your faculty account is ready!" : "Welcome back! Redirecting..."}</strong>
                  <small>Full workspace access is now unlocked for you.</small>
                  <Link href="/">Entering dashboard <b>→</b></Link>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="demo-login-button"
                    onClick={handleDemoLogin}
                  >
                    <span>⚡ Instant Demo Access</span>
                    <small>Sign in as Prof. Arjun Mehta (Faculty Admin)</small>
                  </button>

                  <div className="auth-divider"><span>or with credentials</span></div>

                  <form className="auth-form" onSubmit={handleSubmit}>
                    {isRegistering && (
                      <label>
                        Full name
                        <input
                          name="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Arjun Mehta"
                          required
                        />
                      </label>
                    )}
                    <label>
                      Work email
                      <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institution.edu"
                        required
                      />
                    </label>
                    <label>
                      Password{" "}
                      <span className="label-hint">
                        {isRegistering ? "At least 8 characters" : <Link href="/register">Forgot password?</Link>}
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
                        <span>I agree to the <a href="#terms">Terms of service</a> and <a href="#privacy">Privacy policy</a>.</span>
                      </label>
                    ) : (
                      <label className="check-row">
                        <input type="checkbox" defaultChecked />
                        <span>Keep me signed in</span>
                      </label>
                    )}
                    <button className="auth-submit" type="submit">
                      {isRegistering ? "Create account & Access" : "Sign in & Access"}
                      <span>→</span>
                    </button>
                  </form>
                </>
              )}

              <div className="auth-divider"><span>or continue with</span></div>
              <button
                className="google-button"
                type="button"
                disabled={submitted}
                onClick={handleDemoLogin}
              >
                <span className="google-g">G</span> Google Workspace Single Sign-On
              </button>
              <p className="auth-switch-copy">
                {isRegistering ? "Already have an account?" : "New to AssessIQ?"}{" "}
                <Link href={isRegistering ? "/login" : "/register"}>
                  {isRegistering ? "Sign in" : "Create an account"}
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
      <footer className="auth-footer">
        <span>© 2026 AssessIQ</span>
        <span>Built for better learning outcomes</span>
      </footer>
    </main>
  );
}