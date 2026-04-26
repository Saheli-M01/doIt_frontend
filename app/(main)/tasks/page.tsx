"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CheckCheck,
  CheckCircle2,
  Clock,
  LayoutList,
  Pencil,
  Plus,
  Save,
  Search,
} from "lucide-react";

import AIChat from "@/app/components/AIChat/AIChat";
import { TaskCard } from "@/app/components/tasks/TaskCard";
import { GroupCard } from "@/app/components/tasks/GroupCard";
import { DetailsSlider } from "@/app/components/tasks/DetailsSlider";
import { ViewToggle } from "@/app/components/tasks/ViewToggle";
import { BulkBar } from "@/app/components/tasks/BulkBar";
import { Button, Card, Input } from "@/app/components/tasks/ui";
import { DatePicker } from "@/app/components/tasks/DatePicker";
import { Dropdown, type DropdownOption } from "@/app/components/tasks/Dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { groupTasks } from "@/app/components/tasks/grouping";
import { useUser } from "@/app/context/UserContext";
import { resolveBackendUserId } from "@/lib/backendUser";
import {
  taskNavPagesKey,
  type Task,
  type TaskNavPage,
  type ViewMode,
} from "@/app/components/tasks/types";

const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "low", label: "Low", color: "var(--color-success)" },
  { value: "medium", label: "Medium", color: "var(--color-warning)" },
  { value: "high", label: "High", color: "var(--color-error)" },
];

const PRIORITY_FILTER_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High", color: "var(--color-error)" },
  { value: "medium", label: "Medium", color: "var(--color-warning)" },
  { value: "low", label: "Low", color: "var(--color-success)" },
];

const DATE_SORT_OPTIONS: DropdownOption[] = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
  { value: "none", label: "No sort" },
];

export default function TasksPage() {
  const params = useParams<{ taskPageId?: string }>();
  const { user } = useUser();
  const taskPageId = params?.taskPageId;

  // ── State ──────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState<TaskNavPage | null>(null);
  const [detailsById, setDetailsById] = useState<Record<number, string>>({});

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateSort, setDateSort] = useState("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");

  const [isRenamingPage, setIsRenamingPage] = useState(false);
  const [pageTitleInput, setPageTitleInput] = useState("");

  const [openDetailsTaskId, setOpenDetailsTaskId] = useState<number | null>(null);
  const [detailsDraft, setDetailsDraft] = useState("<p>Add details...</p>");
  const [backendUserId, setBackendUserId] = useState<number | null>(null);

  // ── Loading / mutation guards ──────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true); // true by default — avoids flash of empty
  const [isAdding, setIsAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [savingEditId, setSavingEditId] = useState<number | null>(null);
  const addLockRef = useRef(false); // prevents double-submit

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  useEffect(() => {
    if (!user) return;
    const resolve = async () => {
      try {
        const resolvedId = await resolveBackendUserId(user);
        setBackendUserId(resolvedId);
      } catch {
        setBackendUserId(null);
      }
    };
    void resolve();
  }, [user]);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // backendUserId not yet resolved — stay in loading state, don't show empty
    if (!taskPageId || !user?.id || !/^\d+$/.test(taskPageId)) {
      setTasks([]);
      setDetailsById({});
      setCurrentPage(null);
      setIsLoading(false);
      return;
    }
    if (!backendUserId) {
      // still resolving — keep skeleton showing
      setIsLoading(true);
      return;
    }
    setIsLoading(true);
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/tasks/${backendUserId}`);
        if (!res.ok) throw new Error("Failed to load tasks");
        const allTasks = await res.json();
        const pageTasks = (allTasks ?? [])
          .filter((t: any) => String(t?.taskPage?.id ?? "") === taskPageId)
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            date: t.date,
            priority: t.priority,
          })) as Task[];
        setTasks(pageTasks);
        const pageDetails: Record<number, string> = {};
        (allTasks ?? []).forEach((t: any) => {
          if (String(t?.taskPage?.id ?? "") === taskPageId && t.id) {
            pageDetails[t.id] = t.details ?? "<p>Add details...</p>";
          }
        });
        setDetailsById(pageDetails);
      } catch {
        setTasks([]);
        setDetailsById({});
      }
      try {
        const pagesRes = await fetch(`${baseUrl}/api/task-pages/${backendUserId}`);
        if (!pagesRes.ok) throw new Error("Failed to load task pages");
        const pages = await pagesRes.json();
        const matched = (pages ?? []).find(
          (p: { id: number; name: string }) => String(p.id) === taskPageId,
        );
        setCurrentPage(
          matched ? { id: String(matched.id), name: matched.name } : null,
        );
      } catch {
        setCurrentPage(null);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    window.addEventListener("task-pages-updated", load);
    return () => window.removeEventListener("task-pages-updated", load);
  }, [taskPageId, user?.id, backendUserId, baseUrl]);

  useEffect(() => {
    setExpandedGroups(new Set());
  }, [viewMode]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
        .filter(
          (t) => priorityFilter === "all" || t.priority === priorityFilter,
        )
        .sort((a, b) => {
          if (dateSort === "none") return 0;
          if (dateSort === "asc") return a.date.localeCompare(b.date);
          return b.date.localeCompare(a.date);
        }),
    [tasks, search, priorityFilter, dateSort],
  );

  const groups = useMemo(
    () => groupTasks(filteredTasks, viewMode),
    [filteredTasks, viewMode],
  );

  const stats = useMemo(
    () => ({
      total: tasks.length,
      done: tasks.filter((t) => t.completed).length,
      urgent: tasks.filter((t) => t.priority === "high" && !t.completed).length,
    }),
    [tasks],
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const persistTasks = (next: Task[]) => {
    setTasks(next);
  };

  const addTask = async () => {
    if (!taskPageId || !title.trim() || !backendUserId || !/^\d+$/.test(taskPageId)) return;
    if (addLockRef.current || isAdding) return; // prevent double submit
    addLockRef.current = true;
    setIsAdding(true);
    const today = new Date().toISOString().split("T")[0];
    const taskDate = date || today;
    try {
      const res = await fetch(`${baseUrl}/api/tasks/${backendUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          completed: false,
          date: taskDate,
          priority,
          details: "",
          taskPageId: Number(taskPageId),
        }),
      });
      if (!res.ok) return;
      const created = await res.json();
      persistTasks([
        { id: created.id, title: created.title, completed: created.completed, date: created.date, priority: created.priority },
        ...tasks,
      ]);
      setTitle("");
      setDate("");
    } finally {
      setIsAdding(false);
      addLockRef.current = false;
    }
  };

  const updateTask = async (task: Task) => {
    if (!taskPageId || !/^\d+$/.test(taskPageId)) return;
    const res = await fetch(`${baseUrl}/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...task,
        details: detailsById[task.id] ?? "",
        taskPage: { id: Number(taskPageId) },
      }),
    });
    if (!res.ok) return;
    persistTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
    setEditDate(task.date);
    setEditPriority(task.priority);
  };

  const saveEditedTask = async (task: Task) => {
    if (!editText.trim() || savingEditId === task.id) return;
    setSavingEditId(task.id);
    const today = new Date().toISOString().split("T")[0];
    const taskDate = editDate || today;
    try {
      await updateTask({
        ...task,
        title: editText.trim(),
        date: taskDate,
        priority: editPriority,
      });
      setEditingId(null);
    } finally {
      setSavingEditId(null);
    }
  };

  const toggleTask = async (task: Task) => {
    if (togglingIds.has(task.id)) return;
    setTogglingIds(prev => new Set(prev).add(task.id));
    try {
      await updateTask({ ...task, completed: !task.completed });
    } finally {
      setTogglingIds(prev => { const s = new Set(prev); s.delete(task.id); return s; });
    }
  };

  const deleteTask = async (id: number) => {
    if (deletingIds.has(id)) return;
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`${baseUrl}/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) { console.error("Failed to delete task"); return; }
      persistTasks(tasks.filter((t) => t.id !== id));
      const next = { ...detailsById };
      delete next[id];
      setDetailsById(next);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const openDetailsSlider = (taskId: number) => {
    setOpenDetailsTaskId(taskId);
    setDetailsDraft(detailsById[taskId] ?? "<p>Add details...</p>");
  };

  const saveDetails = async () => {
    if (openDetailsTaskId === null || !taskPageId || !user?.id) return;
    const updated = { ...detailsById, [openDetailsTaskId]: detailsDraft };
    const baseTask = tasks.find((t) => t.id === openDetailsTaskId);
    if (baseTask) {
      await fetch(`${baseUrl}/api/tasks/${openDetailsTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...baseTask,
          details: detailsDraft,
          taskPage: { id: Number(taskPageId) },
        }),
      });
    }
    setDetailsById(updated);
    setOpenDetailsTaskId(null);
  };

  const savePageTitle = async () => {
    if (!taskPageId || !user?.id) return;
    const next = pageTitleInput.trim();
    if (!next) return;
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
      if (/^\d+$/.test(taskPageId)) {
        const updateRes = await fetch(`${baseUrl}/api/task-pages/${taskPageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: next }),
        });
        if (!updateRes.ok) {
          const details = await updateRes.text();
          throw new Error(`Failed to rename task page (${updateRes.status}): ${details}`);
        }
      }

      const s = localStorage.getItem(taskNavPagesKey(user.id));
      const pages = s ? (JSON.parse(s) as TaskNavPage[]) : [];
      localStorage.setItem(
        taskNavPagesKey(user.id),
        JSON.stringify(
          pages.map((p) => (p.id === taskPageId ? { ...p, name: next } : p)),
        ),
      );
      setCurrentPage((prev) =>
        prev && prev.id === taskPageId ? { ...prev, name: next } : prev,
      );
      window.dispatchEvent(new Event("task-pages-updated"));
      setIsRenamingPage(false);
    } catch {
      setIsRenamingPage(false);
    }
  };

  const repeatTasks = async (days: number) => {
    if (!taskPageId || !backendUserId || !/^\d+$/.test(taskPageId)) return;
    const newTasks: Task[] = [];
    
    for (const id of selectedTasks) {
      const orig = tasks.find((t) => t.id === id);
      if (!orig) continue;
      
      for (let i = 1; i <= days; i++) {
        const newDate = new Date(new Date(orig.date).getTime() + i * 86400000)
          .toISOString()
          .split("T")[0];
        
        try {
          const res = await fetch(`${baseUrl}/api/tasks/${backendUserId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: orig.title,
              completed: false,
              date: newDate,
              priority: orig.priority,
              details: detailsById[orig.id] ?? "",
              taskPageId: Number(taskPageId),
            }),
          });
          
          if (res.ok) {
            const created = await res.json();
            newTasks.push({
              id: created.id,
              title: created.title,
              completed: created.completed,
              date: created.date,
              priority: created.priority,
            });
          }
        } catch (error) {
          console.error("Error creating repeated task:", error);
        }
      }
    }
    
    persistTasks([...newTasks, ...tasks]);
    setSelectedTasks([]);
  };

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleSelectTask = (id: number) =>
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // ── Shared props for TaskCard ──────────────────────────────────────────────
  const taskCardProps = {
    editingId,
    editText,
    editDate,
    editPriority,
    onToggle: toggleTask,
    onDelete: deleteTask,
    onStartEdit: startEditing,
    onSaveEdit: saveEditedTask,
    onCancelEdit: () => setEditingId(null),
    onOpenDetails: openDetailsSlider,
    setEditText,
    setEditDate,
    setEditPriority,
    deletingIds,
    togglingIds,
    savingEditId,
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!taskPageId) {
    return (
      <>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-surface border-2 border-dashed border-border rounded-2xl p-12">
          <div className="w-16 h-16 rounded-[18px] flex items-center justify-center bg-primary/12 border border-primary/30">
            <LayoutList size={28} className="text-primary" />
          </div>
          <p className="text-foreground-muted text-base text-center max-w-xs">
            Use the <strong className="text-foreground">+</strong> icon beside Tasks to create and open a new page.
          </p>
        </div>
        {user?.id && <AIChat userId={String(user.id)} mode="floating" />}
      </>
    );
  }

  return (
    <>
      <div className="max-w-[1060px] mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-52 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ) : isRenamingPage ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Input
                value={pageTitleInput}
                onChange={(e) => setPageTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && savePageTitle()}
                placeholder="Page title"
                autoFocus
                style={{ fontSize: 22, fontWeight: 800, minWidth: 220 }}
              />
              <Button onClick={savePageTitle}><Save size={14} /> Save</Button>
              <Button variant="ghost" onClick={() => setIsRenamingPage(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: title + rename */}
              <div className="flex items-center gap-3">
                <h1 className="text-[clamp(22px,5vw,32px)] font-black tracking-tight text-foreground m-0">
                  {currentPage?.name ?? "Task Page"}
                </h1>
                <button
                  onClick={() => { setPageTitleInput(currentPage?.name ?? ""); setIsRenamingPage(true); }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/25 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Pencil size={12} /> Rename
                </button>
              </div>
              {/* Right: stat pills */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { icon: <LayoutList size={12} />, label: `${stats.total} tasks`, cls: "text-primary bg-primary/10 border-primary/25" },
                  { icon: <CheckCircle2 size={12} />, label: `${stats.done} done`, cls: "text-green-500 bg-green-500/10 border-green-500/25" },
                  { icon: <AlertCircle size={12} />, label: `${stats.urgent} urgent`, cls: "text-red-500 bg-red-500/10 border-red-500/25" },
                ].map(({ icon, label, cls }) => (
                  <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* ── Add Task ── */}
        <Card style={{ marginBottom: 20 }}>
          <div className="flex gap-2.5 flex-wrap items-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted whitespace-nowrap">New Task</p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="What needs to be done?"
              style={{ flex: "1 1 160px" }}
            />
            <DatePicker value={date} onChange={setDate} placeholder="Due date" />
            <Dropdown
              value={priority}
              options={PRIORITY_OPTIONS}
              onChange={(next) => setPriority(next as Task["priority"])}
              style={{ minWidth: 138 }}
            />
            <Button onClick={addTask} disabled={!title.trim() || isAdding}>
              {isAdding
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Plus size={17} />
              }
              {isAdding ? "Adding…" : "Add Task"}
            </Button>
          </div>
        </Card>

        {/* ── Controls ── */}
        <div className="flex gap-2.5 mb-3.5 items-center overflow-x-auto">
          <div className="relative flex-1 min-w-36">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              style={{ width: "100%", paddingLeft: 34, boxSizing: "border-box" }}
            />
          </div>
          <Dropdown value={priorityFilter} options={PRIORITY_FILTER_OPTIONS} onChange={setPriorityFilter} style={{ minWidth: 160 }} />
          <Dropdown value={dateSort} options={DATE_SORT_OPTIONS} onChange={setDateSort} style={{ minWidth: 152 }} />
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <Button
            variant="ghost"
            onClick={() => selectedTasks.length === filteredTasks.length ? setSelectedTasks([]) : setSelectedTasks(filteredTasks.map(t => t.id))}
            style={{ fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <CheckCheck size={14} />
            {filteredTasks.length > 0 && selectedTasks.length === filteredTasks.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        {/* ── Bulk actions ── */}
        <BulkBar
          count={selectedTasks.length}
          onRepeat={repeatTasks}
          onDelete={async () => {
            try {
              await Promise.all(selectedTasks.map(id => fetch(`${baseUrl}/api/tasks/${id}`, { method: "DELETE" })));
              persistTasks(tasks.filter(t => !selectedTasks.includes(t.id)));
              setSelectedTasks([]);
            } catch (error) { console.error("Error deleting tasks:", error); }
          }}
        />

        {/* ── All view ── */}
        {viewMode === "all" && (
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-3 py-2.5 rounded-xl border border-border bg-surface">
                  <Skeleton className="w-4 h-4 mt-1 rounded shrink-0" />
                  <Skeleton className="w-5 h-5 mt-1 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-14 text-foreground-muted text-[15px]">
                <Clock size={32} className="mx-auto mb-3 opacity-40" />
                No tasks found
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  {...taskCardProps}
                  details={detailsById[task.id]}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={() => toggleSelectTask(task.id)}
                />
              ))
            )}
          </div>
        )}

        {/* ── Grouped views ── */}
        {viewMode !== "all" && (
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))
            ) : groups.length === 0 ? (
              <div className="text-center py-14 text-foreground-muted text-[15px]">
                <Clock size={32} className="mx-auto mb-3 opacity-40" />
                No tasks found
              </div>
            ) : (
              groups.map(({ key, tasks: groupedTasks }) => (
                <GroupCard
                  key={key}
                  groupKey={key}
                  tasks={groupedTasks}
                  isOpen={expandedGroups.has(key)}
                  onToggle={() => toggleGroup(key)}
                  selectedTasks={selectedTasks}
                  taskCardProps={taskCardProps}
                  onSelectTask={toggleSelectTask}
                  detailsById={detailsById}
                />
              ))
            )}
          </div>
        )}

        {/* ── Details Slider ── */}
        <DetailsSlider
          task={tasks.find(t => t.id === openDetailsTaskId)}
          draft={detailsDraft}
          isOpen={openDetailsTaskId !== null}
          onClose={() => setOpenDetailsTaskId(null)}
          onDraftChange={setDetailsDraft}
          onSave={saveDetails}
        />
      </div>

      {user?.id && (
        <AIChat
          userId={String(user.id)}
          mode="floating"
          onAddTasks={async ({ title, tasks: newTasks }) => {
            if (!taskPageId || !backendUserId || !/^\d+$/.test(taskPageId)) return;
            const today = new Date().toISOString().split("T")[0];
            const formattedTasks = newTasks.map((t, i) => ({
              id: Date.now() + i + Math.floor(Math.random() * 1000),
              title: t.title,
              completed: false,
              date: t.date || today,
              priority: t.priority,
            }));
            const createdTasks: Task[] = [];
            for (const task of formattedTasks) {
              const res = await fetch(`${baseUrl}/api/tasks/${backendUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: task.title,
                  completed: false,
                  date: task.date,
                  priority: task.priority,
                  details: "",
                  taskPageId: Number(taskPageId),
                }),
              });
              if (res.ok) {
                const created = await res.json();
                createdTasks.push({
                  id: created.id,
                  title: created.title,
                  completed: created.completed,
                  date: created.date,
                  priority: created.priority,
                });
              }
            }
            persistTasks([...createdTasks, ...tasks]);

            // 2 page name update
            try {
              if (title?.trim()) {
                await fetch(`${baseUrl}/api/task-pages/${taskPageId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: title.trim() }),
                });
              }

              const s = localStorage.getItem(taskNavPagesKey(user.id));
              const pages = s ? JSON.parse(s) : [];

              localStorage.setItem(
                taskNavPagesKey(user.id),
                JSON.stringify(
                  pages.map((p: any) =>
                    p.id === taskPageId ? { ...p, name: title } : p,
                  ),
                ),
              );
              if (title?.trim()) {
                setCurrentPage((prev) =>
                  prev && prev.id === taskPageId
                    ? { ...prev, name: title.trim() }
                    : prev,
                );
              }

              window.dispatchEvent(new Event("task-pages-updated"));
            } catch { }
          }}
        />
      )}
    </>
  );
}
