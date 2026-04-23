"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import AIChat from "@/app/components/AIChat/AIChat";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { LayoutDashboard, ListTodo, LogOut, Plus, Trash2 } from "lucide-react";
import type { Task } from "@/app/components/tasks/types";

type TaskNavPage = {
  id: string;
  name: string;
};

const TASK_NAV_PAGES_KEY = "task-nav-pages";

const readTaskNavPages = (): TaskNavPage[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(TASK_NAV_PAGES_KEY);
    return stored ? (JSON.parse(stored) as TaskNavPage[]) : [];
  } catch {
    return [];
  }
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, isLoading } = useUser();
  const [taskPages, setTaskPages] = useState<TaskNavPage[]>(readTaskNavPages);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const onTaskPagesUpdated = () => {
      setTaskPages(readTaskNavPages());
    };

    window.addEventListener("task-pages-updated", onTaskPagesUpdated);
    return () => {
      window.removeEventListener("task-pages-updated", onTaskPagesUpdated);
    };
  }, []);

  const persistTaskPages = (pages: TaskNavPage[]) => {
    localStorage.setItem(TASK_NAV_PAGES_KEY, JSON.stringify(pages));
    window.dispatchEvent(new Event("task-pages-updated"));
  };

  const createTaskPage = (generatedTasks: Task[] = []) => {
    const nextIndex = taskPages.length + 1;
    const id = `page-${Date.now()}`;
    const newPage = { id, name: `Task Page ${nextIndex}` };
    const updated = [...taskPages, newPage];
    setTaskPages(updated);
    persistTaskPages(updated);
    if (generatedTasks.length > 0) {
      localStorage.setItem(`task-items-${id}`, JSON.stringify(generatedTasks));
    }
    router.push(`/tasks/${id}`);
  };

  const deleteTaskPage = (pageId: string) => {
    const updated = taskPages.filter((page) => page.id !== pageId);
    setTaskPages(updated);
    persistTaskPages(updated);
    if (pathname === `/tasks/${pageId}`) {
      router.push("/tasks");
    }
  };

  const isTasksActive = pathname.startsWith("/tasks");
  const isDashboardActive = pathname === "/dashboard";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login");
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 h-screen sticky top-0 bg-surface border-r border-border text-foreground p-4 flex flex-col gap-2">
        {/* Logo + toggle row */}
        <div className="flex items-center justify-between mb-4">
          <ThemedLogo />
          <ThemeToggle />
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <button
            onClick={() => router.push("/dashboard")}
            className={`cursor-pointer text-left px-4 py-2 rounded transition-colors text-foreground flex items-center gap-2 ${
              isDashboardActive ? "bg-muted" : "hover:bg-muted"
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <div className="flex flex-col gap-1">
            <div
              className={`px-2 py-1 rounded transition-colors ${
                isTasksActive ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="text-left px-2 py-1 rounded text-foreground flex items-center gap-2 flex-1">
                  <ListTodo size={18} />
                  Tasks
                </div>
                <button
                  onClick={createTaskPage}
                  className="cursor-pointer p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="Create task page"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {taskPages.length > 0 && (
              <div className="ml-7 mr-1 mt-1 space-y-1">
                {taskPages.map((page) => (
                  <div
                    key={page.id}
                    className={`group flex items-center justify-between rounded px-2 py-1 ${
                      pathname === `/tasks/${page.id}`
                        ? "bg-muted"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    <button
                      onClick={() => router.push(`/tasks/${page.id}`)}
                      className="cursor-pointer text-sm text-left text-foreground-muted hover:text-foreground truncate flex-1"
                    >
                      {page.name}
                    </button>
                    <button
                      onClick={() => deleteTaskPage(page.id)}
                      className="p-1 rounded text-error/80 hover:text-error hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Delete ${page.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="pb-2 ">
          <AIChat
            userId={user.id}
            mode="sidebar"
            onCreateTaskPage={createTaskPage}
          />
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded text-error hover:bg-muted transition-colors text-left flex items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-background text-foreground overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
