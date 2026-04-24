"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import AIChat from "@/app/components/AIChat/AIChat";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { resolveBackendUserId } from "@/lib/backendUser";
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
import { taskNavPagesKey, taskItemsKey } from "@/app/components/tasks/types";

type TaskNavPage = {
  id: string;
  name: string;
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, isLoading } = useUser();
  const [taskPages, setTaskPages] = useState<TaskNavPage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load task pages from backend for this user
  useEffect(() => {
    if (!user) return;
    const loadPages = async () => {
      try {
        const backendUserId = await resolveBackendUserId(user);
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/task-pages/${backendUserId}`);
        if (!res.ok) throw new Error("Failed to load task pages");
        const pages = await res.json();
        const normalized = (pages ?? []).map((p: { id: number; name: string }) => ({
          id: String(p.id),
          name: p.name,
        }));
        setTaskPages(normalized);
        localStorage.setItem(taskNavPagesKey(user.id), JSON.stringify(normalized));
      } catch {
        setTaskPages([]);
      }
    };
    void loadPages();
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);
  useEffect(() => {
    const onTaskPagesUpdated = () => {
      if (!user) return;
      try {
        const stored = localStorage.getItem(taskNavPagesKey(user.id));
        setTaskPages(stored ? (JSON.parse(stored) as TaskNavPage[]) : []);
      } catch {
        setTaskPages([]);
      }
    };

    window.addEventListener("task-pages-updated", onTaskPagesUpdated);
    return () => {
      window.removeEventListener("task-pages-updated", onTaskPagesUpdated);
    };
  }, [user]);

  const persistTaskPages = (pages: TaskNavPage[]) => {
    if (!user) return;
    localStorage.setItem(taskNavPagesKey(user.id), JSON.stringify(pages));
    window.dispatchEvent(new Event("task-pages-updated"));
  };

  const createTaskPage = async (generatedTasks: Task[] = [], pageName?: string) => {

    if (!user) return;
    const nextIndex = taskPages.length + 1;
    const finalName = pageName?.trim() || `Task Page ${nextIndex}`;

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");


    const backendUserId = await resolveBackendUserId(user);

    const createRes = await fetch(`${baseUrl}/api/task-pages/${backendUserId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: finalName,
        sortOrder: 0,
      }),
    });
    if (!createRes.ok) {
      const details = await createRes.text();
      throw new Error(`Failed to create task page (${createRes.status}): ${details}`);
    }
    const createdPage = await createRes.json();
    const id = String(createdPage?.id ?? "");
    if (!id) {
      throw new Error("Backend did not return created task page id");
    }

    const newPage = { id, name: finalName };
    const updated = [...taskPages, newPage];
    setTaskPages(updated);
    persistTaskPages(updated);

    if (generatedTasks.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      await Promise.all(
        generatedTasks.map((task) =>
          fetch(`${baseUrl}/api/tasks/${backendUserId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: task.title,
              completed: Boolean(task.completed),
              date: task.date || today,
              priority: task.priority,
              details: "",
              taskPageId: Number(id),
            }),
          }),
        ),
      );
    }
    
    router.push(`/tasks/${id}`);
  };

  const deleteTaskPage = async (pageId: string) => {
    if (!user) return;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

    if (/^\d+$/.test(pageId)) {
      const deleteRes = await fetch(`${baseUrl}/api/task-pages/${pageId}`, {
        method: "DELETE",
      });
      if (!deleteRes.ok) {
        const details = await deleteRes.text();
        throw new Error(`Failed to delete task page (${deleteRes.status}): ${details}`);
      }
    }

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
        className={`md:hidden fixed top-4 z-50 p-2 rounded-md bg-surface text-foreground border border-border shadow-sm transition-all duration-300 ease-in-out ${isSidebarOpen ? "left-[15.5rem]" : "left-4"
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
            className={`cursor-pointer text-left px-4 py-2 rounded transition-colors text-foreground flex items-center gap-2 ${isDashboardActive ? "bg-muted" : "hover:bg-muted"
              }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <div className="flex flex-col gap-1">
            <div
              className={`px-2 py-1 rounded transition-colors ${isTasksActive ? "bg-muted" : "hover:bg-muted"
                }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="text-left px-2 py-1 rounded text-foreground flex items-center gap-2 flex-1">
                  <ListTodo size={18} />
                  Task Pages
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
                    className={`group flex items-center justify-between rounded px-2 py-1 ${pathname === `/tasks/${page.id}`
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
