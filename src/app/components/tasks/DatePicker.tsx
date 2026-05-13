"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;
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
function toYMD(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function formatDisplay(ymd: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return `${pad(d)} ${MONTHS[m-1].slice(0,3)} ${y}`;
}

export function DatePicker({ value, onChange, placeholder = "Due date", style }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayYMD = toYMD(today);
  const initDate = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelHeight = 320; // approx calendar height
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < panelHeight + 16;
    setPanelStyle({
      position: "fixed",
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
      left: rect.left,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => { if (open) updatePosition(); }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node) || panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
  const cells: { day: number; month: "prev" | "cur" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: "cur" });
  for (let d = 1; d <= 42 - cells.length; d++) cells.push({ day: d, month: "next" });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  const selectDay = (day: number, month: "prev" | "cur" | "next") => {
    let m = viewMonth, y = viewYear;
    if (month === "prev") { m--; if (m < 0) { m = 11; y--; } }
    if (month === "next") { m++; if (m > 11) { m = 0; y++; } }
    onChange(`${y}-${pad(m+1)}-${pad(day)}`);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", ...style }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-[10px] bg-surface text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors border min-w-[148px] ${
          open ? "border-primary text-foreground" : "border-border"
        } ${value ? "text-foreground" : "text-foreground-muted"}`}
      >
        <CalendarDays size={14} className="text-primary shrink-0" />
        {value ? formatDisplay(value) : placeholder}
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={panelRef}
          style={{ ...panelStyle, animation: "dpIn 0.14s ease", width: 272 }}
          className="bg-surface border border-border rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.22)] p-3"
        >
          {/* Nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg bg-muted border border-border text-foreground hover:bg-border transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold text-foreground">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg bg-muted border border-border text-foreground hover:bg-border transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <span key={d} className="text-center text-[11px] font-bold text-foreground-muted py-1">{d}</span>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, i) => {
              const m = cell.month === "prev" ? (viewMonth === 0 ? 11 : viewMonth-1) : cell.month === "next" ? (viewMonth === 11 ? 0 : viewMonth+1) : viewMonth;
              const y = (cell.month === "prev" && viewMonth === 0) ? viewYear-1 : (cell.month === "next" && viewMonth === 11) ? viewYear+1 : viewYear;
              const cellYMD = `${y}-${pad(m+1)}-${pad(cell.day)}`;
              const isSelected = cellYMD === value;
              const isToday = cellYMD === todayYMD;
              const isOther = cell.month !== "cur";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(cell.day, cell.month)}
                  className={`aspect-square w-full rounded-lg text-[12px] flex items-center justify-center transition-colors
                    ${isSelected ? "bg-primary text-white font-bold" : isToday ? "border border-primary text-foreground font-bold hover:bg-muted" : "hover:bg-muted text-foreground"}
                    ${isOther ? "opacity-30" : ""}
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-2.5 pt-2 border-t border-border">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-[12px] text-foreground-muted hover:text-foreground px-2 py-1 rounded transition-colors">Clear</button>
            <button type="button" onClick={() => { onChange(todayYMD); setOpen(false); }} className="text-[12px] text-primary font-semibold px-2 py-1 rounded hover:bg-primary/10 transition-colors">Today</button>
          </div>
        </div>,
        document.body
      )}

      <style>{`@keyframes dpIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
