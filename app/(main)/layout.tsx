"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import AIChat from "@/app/components/AIChat/AIChat";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import Link from "next/link";
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  Trash2,
  Menu,
  X,
} from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);
  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
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

  const createTaskPage = (generatedTasks: Task[] = [], pageName?: string) => {
    const nextIndex = taskPages.length + 1;
    const finalName = pageName?.trim() || `Task Page ${nextIndex}`;
    const slug = slugify(finalName);

    // short id (6 chars)
    const shortId = Math.random().toString(36).substring(2, 8);

    const id = `${slug}-${shortId}`;
    const newPage = { id, name: finalName };
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
    <div className="flex min-h-screen relative w-full overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Toggle Button (Mobile) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden fixed top-4 z-50 p-2 rounded-md bg-surface text-foreground border border-border shadow-sm transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "left-[15.5rem]" : "left-4"
        }`}
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-surface border-r border-border text-foreground p-4 flex flex-col gap-2 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}
      >
        {/* Logo + toggle row */}
        <div className="flex items-center justify-between mb-4 mt-12 md:mt-0">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <ThemedLogo />
          </Link>
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
                  onClick={() => createTaskPage()}
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
            userId={String(user.id)}
            mode="sidebar"
            onCreateTaskPage={({ title, tasks }) => {
              const formattedTasks = tasks.map((t, i) => ({
                id: Date.now() + i,
                title: t.title,
                completed: false,
                date: t.date,
                priority: t.priority,
              }));

              createTaskPage(formattedTasks, title);
            }}
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
      <main className="flex-1 w-full h-screen overflow-y-auto bg-background text-foreground relative">
        <div className="p-4 md:p-6 mt-14 md:mt-0 max-w-full">{children}</div>
      </main>
    </div>
  );
}
