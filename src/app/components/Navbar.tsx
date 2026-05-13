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
import { useClerk } from "@clerk/nextjs";

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
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!profileOpen) return;
    const onOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await signOut({ redirectUrl: "/" });
  };

  return (
    <>
      <header className="w-full border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo — left */}
          <ThemedLogo />

          {/* Mobile: hamburger */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop nav — right */}
          <nav className="hidden md:flex items-center gap-2">

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Contact */}
            {onContactClick && (
              <button
                onClick={onContactClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted text-sm text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact
              </button>
            )}

            {/* Not logged in */}
            {showAuthButtons && !user && (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium hover:bg-muted transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Logged in — profile dropdown */}
            {showAuthButtons && user && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-surface text-sm font-medium hover:bg-muted transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <User className="w-4 h-4" />
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
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
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors text-error"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
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
