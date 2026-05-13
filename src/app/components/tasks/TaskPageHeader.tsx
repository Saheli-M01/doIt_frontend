"use client";

import { AlertCircle, CheckCircle2, LayoutList, Pencil, Save } from "lucide-react";
import { Button, Input } from "./ui";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskPageHeaderProps {
  isLoading: boolean;
  isRenamingPage: boolean;
  currentPageName: string | null;
  pageTitleInput: string;
  stats: {
    total: number;
    done: number;
    urgent: number;
  };
  onPageTitleChange: (value: string) => void;
  onSavePageTitle: () => void;
  onStartRename: () => void;
  onCancelRename: () => void;
}

export function TaskPageHeader({
  isLoading,
  isRenamingPage,
  currentPageName,
  pageTitleInput,
  stats,
  onPageTitleChange,
  onSavePageTitle,
  onStartRename,
  onCancelRename,
}: TaskPageHeaderProps) {
  return (
    <div className="mb-4 md:mb-6">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-52 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ) : (
        <>
          {isRenamingPage ? (
            <div className="flex items-center gap-2.5 flex-wrap mb-3">
              <Input
                value={pageTitleInput}
                onChange={(e) => onPageTitleChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSavePageTitle()}
                placeholder="Page title"
                autoFocus
                style={{ fontSize: 22, fontWeight: 800, minWidth: 220 }}
              />
              <Button onClick={onSavePageTitle}>
                <Save size={14} /> Save
              </Button>
              <Button variant="ghost" onClick={onCancelRename}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <h1 className="text-[clamp(20px,5vw,26px)] font-black tracking-tight text-foreground m-0">
                {currentPageName ?? "Task Page"}
              </h1>
              <button
                onClick={onStartRename}
                className="inline-flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-semibold text-primary bg-primary/10 border border-primary/25 px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Pencil size={10} className="md:w-3 md:h-3" />
                <span className="hidden sm:inline">Rename</span>
              </button>
            </div>
          )}

          {/* Stat pills - always visible */}
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {[
              {
                icon: <LayoutList size={12} />,
                label: `${stats.total} tasks`,
                cls: "text-primary bg-primary/10 border-primary/25",
              },
              {
                icon: <CheckCircle2 size={12} />,
                label: `${stats.done} done`,
                cls: "text-green-500 bg-green-500/10 border-green-500/25",
              },
              {
                icon: <AlertCircle size={12} />,
                label: `${stats.urgent} urgent`,
                cls: "text-red-500 bg-red-500/10 border-red-500/25",
              },
            ].map(({ icon, label, cls }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
