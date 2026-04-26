"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function Dropdown({ value, options, onChange, style, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Position the portal menu under the trigger
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: rect.left,
      minWidth: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll/resize to avoid stale position
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ position: "relative", ...style }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] bg-surface text-foreground text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors w-full min-w-[120px] border ${
          open ? "border-primary" : "border-border"
        }`}
      >
        <span className="flex items-center gap-1.5">
          {selected?.color && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: selected.color }}
            />
          )}
          {selected?.label ?? placeholder ?? "Select…"}
        </span>
        <ChevronDown
          size={14}
          className={`text-foreground-muted shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Portal menu */}
      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{ ...menuStyle, animation: "dropdownIn 0.14s ease" }}
          className="bg-surface border border-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden"
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex items-center justify-between gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-left border-none cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "bg-transparent text-foreground hover:bg-muted font-normal"
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt.color && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: opt.color }}
                    />
                  )}
                  {opt.label}
                </span>
                {isActive && <Check size={13} className="text-primary shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
