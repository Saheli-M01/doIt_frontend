"use client";

import Link from "next/link";
import { Mail, Menu } from "lucide-react";
import { ThemedLogo } from "./ThemedLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { MobileSidebar } from "./MobileSidebar";

type NavbarProps = {
  onContactClick?: () => void;
  showAuthButtons?: boolean;
};

export function Navbar({
  onContactClick,
  showAuthButtons = true,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

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

            {showAuthButtons && (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium hover:bg-muted"
              >
                Sign in
              </Link>
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