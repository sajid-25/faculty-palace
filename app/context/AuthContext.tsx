"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type UserRole = "faculty" | "admin" | "reviewer";

export type RoleConfig = {
  role: UserRole;
  label: string;
  title: string;
  description: string;
  badgeClass: string;
  canUpload: boolean;
  canApprove: boolean;
  canEditBank: boolean;
  canConfigureAudit: boolean;
};

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    role: "admin",
    label: "Department Head",
    title: "Exam Committee Chair & Dept Head",
    description: "Oversees all courses, approves exam papers for final printing, and manages institutional question archives.",
    badgeClass: "badge-admin",
    canUpload: true,
    canApprove: true,
    canEditBank: true,
    canConfigureAudit: true,
  },
  faculty: {
    role: "faculty",
    label: "Course Instructor",
    title: "Faculty Instructor",
    description: "Uploads syllabus & draft exams, runs AI assessments, and proposes new questions for course modules.",
    badgeClass: "badge-faculty",
    canUpload: true,
    canApprove: false,
    canEditBank: true,
    canConfigureAudit: true,
  },
  reviewer: {
    role: "reviewer",
    label: "External Examiner",
    title: "External Moderator & Examiner",
    description: "Read-only access to inspect cognitive Bloom balances, syllabus coverage, and moderation flags.",
    badgeClass: "badge-reviewer",
    canUpload: false,
    canApprove: false,
    canEditBank: false,
    canConfigureAudit: false,
  },
};

export type User = {
  name: string;
  email: string;
  role: UserRole;
  initials: string;
};

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    name: "Dr. Sarah Rahman",
    email: "sarah.rahman@institution.edu",
    role: "admin",
    initials: "SR",
  },
  faculty: {
    name: "Arjun Mehta",
    email: "arjun.mehta@institution.edu",
    role: "faculty",
    initials: "AM",
  },
  reviewer: {
    name: "Prof. David Chen",
    email: "david.chen@external-board.edu",
    role: "reviewer",
    initials: "DC",
  },
};

type AuthContextType = {
  user: User | null;
  roleConfig: RoleConfig | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  can: (action: "upload" | "approve" | "editBank" | "configureAudit") => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = window.setTimeout(() => {
      fetch("/api/auth/me")
        .then(async (response) => {
          if (!response.ok) return;
          const data = await response.json();
          if (data.user) setUser(data.user as User);
        })
        .catch(() => undefined)
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(restoreSession);
  }, []);

  const applyUser = (data: { id: string; name: string; email: string; role: UserRole }) => {
    setUser({ ...data, initials: getInitials(data.name) });
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to sign in.");
    applyUser(data.user);
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to create the account.");
    applyUser(data.user);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  };

  const roleConfig = user ? ROLE_CONFIGS[user.role] : null;

  const can = (action: "upload" | "approve" | "editBank" | "configureAudit") => {
    if (!user || !roleConfig) return false;
    if (action === "upload") return roleConfig.canUpload;
    if (action === "approve") return roleConfig.canApprove;
    if (action === "editBank") return roleConfig.canEditBank;
    if (action === "configureAudit") return roleConfig.canConfigureAudit;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roleConfig,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
