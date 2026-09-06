"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isRegistering = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
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
              <strong>{isRegistering ? "Your account is ready to set up." : "You’re signed in for this demo."}</strong>
              <small>The backend authentication flow will connect here next.</small>
              <Link href="/">Return to dashboard <b>→</b></Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {isRegistering && <label>Full name<input name="name" type="text" placeholder="e.g. Arjun Mehta" required /></label>}
              <label>Work email<input name="email" type="email" placeholder="you@institution.edu" required /></label>
              <label>Password <span className="label-hint">{isRegistering ? "At least 8 characters" : <Link href="/register">Forgot password?</Link>}</span><span className="password-field"><input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" minLength={8} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></span></label>
              {isRegistering ? <label className="check-row"><input type="checkbox" required /><span>I agree to the <a href="#terms">Terms of service</a> and <a href="#privacy">Privacy policy</a>.</span></label> : <label className="check-row"><input type="checkbox" /><span>Keep me signed in</span></label>}
              <button className="auth-submit" type="submit">{isRegistering ? "Create account" : "Sign in"}<span>→</span></button>
            </form>
          )}

          <div className="auth-divider"><span>or continue with</span></div>
          <button className="google-button" type="button" disabled={submitted}><span className="google-g">G</span> Google Workspace</button>
          <p className="auth-switch-copy">{isRegistering ? "Already have an account?" : "New to AssessIQ?"} <Link href={isRegistering ? "/login" : "/register"}>{isRegistering ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </section>
      <footer className="auth-footer"><span>© 2026 AssessIQ</span><span>Built for better learning outcomes</span></footer>
    </main>
  );
}