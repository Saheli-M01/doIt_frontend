"use client";

import Link from "next/link";
import {
  Mail,
  Menu,
  User,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { ThemedLogo } from "./ThemedLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { MobileSidebar } from "./MobileSidebar";
import { useUser } from "@/app/context/UserContext";

type NavbarProps = {
  onContactClick?: () => void;
  showAuthButtons?: boolean;
};

export function Navbar({
  onContactClick,
  showAuthButtons = true,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useUser();

  useEffect(() => {
    if (!profileOpen) return;

    const onOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [profileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setProfileOpen(false);
  };

  return (
    <>
      <header className="w-full border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <ThemedLogo />

          {/* Mobile: hamburger only */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {showAuthButtons && !user && (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium hover:bg-muted"
              >
                Sign in
              </Link>
            )}

            {showAuthButtons && user && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-surface text-sm font-medium hover:bg-muted"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <User className="w-4 h-4" />
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface shadow-xl p-1 z-50"
                  >
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-muted text-error"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {onContactClick && (
              <button
                onClick={onContactClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted text-sm"
              >
                <Mail className="w-4 h-4" />
                Contact
              </button>
            )}
          </div>
        </div>
      </header>

      <MobileSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onContactClick={onContactClick}
        showAuthButtons={showAuthButtons}
      />
    </>
  );
}
