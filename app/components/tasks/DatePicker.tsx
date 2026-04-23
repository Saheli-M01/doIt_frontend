"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;          // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function pad(n: number) { return String(n).padStart(2, "0"); }

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplay(ymd: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return `${pad(d)} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", style }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const initDate = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; month: "prev" | "cur" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month: "cur" });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, month: "next" });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const selectDay = (day: number, month: "prev" | "cur" | "next") => {
    let m = viewMonth, y = viewYear;
    if (month === "prev") { m -= 1; if (m < 0) { m = 11; y -= 1; } }
    if (month === "next") { m += 1; if (m > 11) { m = 0; y += 1; } }
    onChange(`${y}-${pad(m + 1)}-${pad(day)}`);
    setOpen(false);
  };

  const todayYMD = toYMD(today);

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          background: "var(--color-surface)",
          border: `1.5px solid ${open ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: 10,
          color: value ? "var(--color-foreground)" : "var(--color-foreground-muted)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "border-color 0.18s",
          minWidth: 148,
        }}
      >
        <CalendarDays size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
        {value ? formatDisplay(value) : placeholder}
      </button>

      {/* Calendar panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 200,
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            padding: "14px 12px 10px",
            width: 272,
            animation: "dropdownIn 0.14s ease",
          }}
        >
          {/* Month / year nav */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 12,
          }}>
            <button
              type="button"
              onClick={prevMonth}
              style={navBtnStyle}
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>

            <span style={{
              fontWeight: 700, fontSize: 14,
              color: "var(--color-foreground)",
            }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              style={navBtnStyle}
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
            {DAYS.map((d) => (
              <span key={d} style={{
                textAlign: "center", fontSize: 11, fontWeight: 700,
                color: "var(--color-foreground-muted)",
                padding: "4px 0",
              }}>
                {d}
              </span>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {cells.map((cell, i) => {
              const m = cell.month === "prev"
                ? viewMonth - 1 < 0 ? 11 : viewMonth - 1
                : cell.month === "next"
                  ? viewMonth + 1 > 11 ? 0 : viewMonth + 1
                  : viewMonth;
              const y = cell.month === "prev" && viewMonth === 0
                ? viewYear - 1
                : cell.month === "next" && viewMonth === 11
                  ? viewYear + 1
                  : viewYear;
              const cellYMD = `${y}-${pad(m + 1)}-${pad(cell.day)}`;
              const isSelected = cellYMD === value;
              const isToday = cellYMD === todayYMD;
              const isOtherMonth = cell.month !== "cur";

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(cell.day, cell.month)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 8,
                    border: isToday && !isSelected
                      ? "1.5px solid var(--color-primary)"
                      : "1.5px solid transparent",
                    background: isSelected
                      ? "var(--color-primary)"
                      : "transparent",
                    color: isSelected
                      ? "#fff"
                      : isOtherMonth
                        ? "var(--color-foreground-muted)"
                        : "var(--color-foreground)",
                    fontSize: 12,
                    fontWeight: isSelected || isToday ? 700 : 400,
                    cursor: "pointer",
                    opacity: isOtherMonth ? 0.4 : 1,
                    transition: "background 0.12s, color 0.12s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--color-muted)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 10, paddingTop: 8,
            borderTop: "1px solid var(--color-border)",
          }}>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              style={footerBtnStyle}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { onChange(todayYMD); setOpen(false); }}
              style={{ ...footerBtnStyle, color: "var(--color-primary)", fontWeight: 600 }}
            >
              Today
            </button>
          </div>
        </div>
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

const navBtnStyle: React.CSSProperties = {
  background: "var(--color-muted)",
  border: "1px solid var(--color-border)",
  borderRadius: 7,
  padding: "4px 6px",
  cursor: "pointer",
  color: "var(--color-foreground)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
};

const footerBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--color-foreground-muted)",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: 6,
};
