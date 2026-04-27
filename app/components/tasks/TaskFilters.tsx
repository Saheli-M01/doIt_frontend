"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  CheckCheck,
  ArrowUpDown,
  AlertCircle,
  Eye,
  LayoutList,
  Calendar,
  Clock,
} from "lucide-react";
import { Button, Input } from "./ui";
import { Dropdown, type DropdownOption } from "./Dropdown";
import type { ViewMode } from "./types";

interface TaskFiltersProps {
  search: string;
  priorityFilter: string;
  dateSort: string;
  mobileViewFilter: string;
  selectedTasksCount: number;
  filteredTasksCount: number;
  onSearchChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
  onDateSortChange: (value: string) => void;
  onMobileViewFilterChange: (value: string, viewMode?: ViewMode) => void;
  onSelectAll: () => void;
  priorityOptions: DropdownOption[];
  dateSortOptions: DropdownOption[];
  viewOptions: DropdownOption[];
}

export function TaskFilters({
  search,
  priorityFilter,
  dateSort,
  mobileViewFilter,
  selectedTasksCount,
  filteredTasksCount,
  onSearchChange,
  onPriorityFilterChange,
  onDateSortChange,
  onMobileViewFilterChange,
  onSelectAll,
  priorityOptions,
  dateSortOptions,
  viewOptions,
}: TaskFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="flex flex-col gap-2.5 mb-3.5">
      {/* Mobile: Compact controls */}
      <div className="flex md:hidden gap-2 items-center">
        {/* Filter Button */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`p-2 rounded-lg border transition-colors ${
            showMobileFilters
              ? "bg-primary/10 border-primary text-primary"
              : "bg-surface border-border text-foreground"
          }`}
          title="Filters"
        >
          <Filter size={18} />
        </button>

        {/* Select All */}
        <Button
          variant="ghost"
          onClick={onSelectAll}
          style={{ fontSize: 12, padding: "8px 12px", flexShrink: 0 }}
          title="Select all"
        >
          <CheckCheck size={16} />
        </Button>

        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            style={{
              width: "100%",
              paddingLeft: 34,
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Mobile: Filter Panel */}
      {showMobileFilters && (
        <div className="md:hidden bg-surface border border-border rounded-xl p-3 space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ArrowUpDown size={12} />
              Sort By
            </label>
            <div className="flex gap-2">
              {dateSortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onDateSortChange(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    dateSort === opt.value
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground hover:bg-border"
                  }`}
                >
                  <Calendar size={13} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertCircle size={12} />
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onPriorityFilterChange(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    priorityFilter === opt.value
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground hover:bg-border"
                  }`}
                >
                  {opt.color ? (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: opt.color }}
                    />
                  ) : (
                    <LayoutList size={13} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Eye size={12} />
              View
            </label>
            <div className="grid grid-cols-3 gap-2">
              {viewOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value !== "all" && opt.value !== "today") {
                      onMobileViewFilterChange(opt.value, opt.value as ViewMode);
                    } else {
                      onMobileViewFilterChange(opt.value, "all");
                    }
                  }}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                    mobileViewFilter === opt.value
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground hover:bg-border"
                  }`}
                >
                  {opt.value === "all" ? (
                    <LayoutList size={13} />
                  ) : opt.value === "today" ? (
                    <Clock size={13} />
                  ) : (
                    <Calendar size={13} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop: All in one row */}
      <div className="hidden md:flex gap-2.5 items-center w-full">
        <div className="relative flex-1 min-w-36">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            style={{
              width: "100%",
              paddingLeft: 34,
              boxSizing: "border-box",
            }}
          />
        </div>
        <Dropdown
          value={priorityFilter}
          options={priorityOptions}
          onChange={onPriorityFilterChange}
          style={{ minWidth: 160 }}
        />
        <Dropdown
          value={dateSort}
          options={dateSortOptions}
          onChange={onDateSortChange}
          style={{ minWidth: 152 }}
        />
        <Dropdown
          value={mobileViewFilter}
          options={viewOptions}
          onChange={(v) => {
            if (v !== "all" && v !== "today") {
              onMobileViewFilterChange(v, v as ViewMode);
            } else {
              onMobileViewFilterChange(v, "all");
            }
          }}
          style={{ minWidth: 100 }}
        />
        <Button
          variant="ghost"
          onClick={onSelectAll}
          style={{ fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          <CheckCheck size={14} />
          {filteredTasksCount > 0 && selectedTasksCount === filteredTasksCount
            ? "Deselect All"
            : "Select All"}
        </Button>
      </div>
    </div>
  );
}
