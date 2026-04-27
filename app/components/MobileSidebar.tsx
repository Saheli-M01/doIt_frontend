"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Mail, LogOut } from "lucide-react";
import { ThemedLogo } from "./ThemedLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "@/app/context/UserContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onContactClick?: () => void;
  showAuthButtons?: boolean;
};

export function MobileSidebar({
  isOpen,
  onClose,
  onContactClick,
  showAuthButtons = true,
}: Props) {
  const { user, setUser } = useUser();
  const authHref = user ? "/dashboard" : "/auth/login";
  const authLabel = user ? "Your Dashboard" : "Sign in";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* sidebar — slides in from the right */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-background border-l border-border z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header: logo + close */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <Link href="/" onClick={onClose}>
            <ThemedLogo />
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* content — production sequence: theme, sign in, contact */}
        <div className="flex flex-col p-4 gap-1 text-sm">
          {/* Theme toggle row */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition">
            <span className="text-foreground-muted">Theme</span>
            <ThemeToggle />
          </div>

          {showAuthButtons && (
            <Link
              href={authHref}
              onClick={onClose}
              className="px-3 py-2.5 rounded-lg hover:bg-muted transition font-medium"
            >
              {authLabel}
            </Link>
          )}

          {showAuthButtons && user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted transition text-left text-error"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}

          {onContactClick && (
            <button
              onClick={() => {
                onContactClick();
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted transition text-left"
            >
              <Mail className="w-4 h-4" />
              Contact
            </button>
          )}
        </div>
      </div>
    </>
  );
}
