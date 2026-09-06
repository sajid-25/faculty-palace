"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";
import { useTheme, Theme } from "../context/ThemeContext";

interface ThemeSwitcherProps {
  variant?: "segmented" | "dropdown" | "compact";
  className?: string;
}

export default function ThemeSwitcher({ variant = "segmented", className = "" }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!mounted) {
    // Avoid hydration mismatch by rendering a placeholder
    return (
      <div className={`theme-switcher-placeholder ${className}`} aria-hidden="true">
        <div className="theme-switcher-pill" />
      </div>
    );
  }

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: "light",
      label: "Light",
      icon: <Sun size={13} className="theme-opt-icon" />,
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon size={13} className="theme-opt-icon" />,
    },
    {
      value: "system",
      label: "System",
      icon: <Laptop size={13} className="theme-opt-icon" />,
    },
  ];

  if (variant === "dropdown" || variant === "compact") {
    const currentOption = options.find((o) => o.value === theme) || options[2];
    const ActiveIcon =
      theme === "system" ? (
        resolvedTheme === "dark" ? <Moon size={14} /> : <Sun size={14} />
      ) : theme === "dark" ? (
        <Moon size={14} />
      ) : (
        <Sun size={14} />
      );

    return (
      <div className={`theme-dropdown-container ${className}`} ref={dropdownRef}>
        <button
          type="button"
          className="theme-dropdown-trigger"
          onClick={() => setDropdownOpen((prev) => !prev)}
          title={`Current Theme: ${currentOption.label} (${theme === "system" ? `System: ${resolvedTheme}` : theme})`}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-label="Toggle theme selection"
        >
          <span className="theme-trigger-icon">{ActiveIcon}</span>
          <span className="theme-trigger-label">{currentOption.label}</span>
          <ChevronDown size={11} className={`theme-arrow ${dropdownOpen ? "open" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="theme-dropdown-menu" role="listbox" aria-label="Select color theme">
            {options.map((opt) => {
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`theme-dropdown-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setTheme(opt.value);
                    setDropdownOpen(false);
                  }}
                >
                  <span className="theme-item-icon">{opt.icon}</span>
                  <span className="theme-item-text">{opt.label}</span>
                  {isSelected && <Check size={12} className="theme-check" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default: Segmented Control
  return (
    <div
      className={`theme-segmented-control ${className}`}
      role="radiogroup"
      aria-label="Theme mode switcher"
    >
      {options.map((opt) => {
        const isSelected = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`theme-segmented-btn ${isSelected ? "active" : ""}`}
            onClick={() => setTheme(opt.value)}
            title={`Set theme to ${opt.label}${opt.value === "system" ? " (auto follows device)" : ""}`}
          >
            {opt.icon}
            <span className="theme-segmented-label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

