"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type User = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, name?: string, role?: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
};

const defaultUser: User = {
  name: "Arjun Mehta",
  email: "arjun.mehta@institution.edu",
  role: "Faculty Admin",
  initials: "AM",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("assessiq_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, name?: string, role?: string) => {
    const finalName = name || (email.toLowerCase().includes("arjun") ? "Arjun Mehta" : email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    const finalRole = role || "Faculty Member";
    const newUser: User = {
      name: finalName,
      email,
      role: finalRole,
      initials: getInitials(finalName),
    };
    setUser(newUser);
    try {
      localStorage.setItem("assessiq_user", JSON.stringify(newUser));
    } catch {
      // Ignore
    }
  };

  const register = (name: string, email: string) => {
    const newUser: User = {
      name: name.trim() || "Faculty Member",
      email: email.trim(),
      role: "Faculty Member",
      initials: getInitials(name || email),
    };
    setUser(newUser);
    try {
      localStorage.setItem("assessiq_user", JSON.stringify(newUser));
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("assessiq_user");
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
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

export { defaultUser };
