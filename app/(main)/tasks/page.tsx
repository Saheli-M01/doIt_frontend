"use client";

import { useState, useEffect, useMemo } from "react";
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
import { groupTasks } from "@/app/components/tasks/grouping";
import { useUser } from "@/app/context/UserContext";
import {
  TASK_NAV_PAGES_KEY,
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

  const [openDetailsTaskId, setOpenDetailsTaskId] = useState<number | null>(
    null,
  );
  const [detailsDraft, setDetailsDraft] = useState("<p>Add details...</p>");

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!taskPageId) {
      setTasks([]);
      setDetailsById({});
      setCurrentPage(null);
      return;
    }
    const load = () => {
      try {
        const s = localStorage.getItem(`task-items-${taskPageId}`);
        setTasks(s ? (JSON.parse(s) as Task[]) : []);
      } catch {
        setTasks([]);
      }
      try {
        const s = localStorage.getItem(`task-details-${taskPageId}`);
        setDetailsById(s ? (JSON.parse(s) as Record<number, string>) : {});
      } catch {
        setDetailsById({});
      }
      try {
        const s = localStorage.getItem(TASK_NAV_PAGES_KEY);
        const pages = s ? (JSON.parse(s) as TaskNavPage[]) : [];
        setCurrentPage(pages.find((p) => p.id === taskPageId) ?? null);
      } catch {
        setCurrentPage(null);
      }
    };
    load();
    window.addEventListener("task-pages-updated", load);
    return () => window.removeEventListener("task-pages-updated", load);
  }, [taskPageId]);

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
          const tA = new Date(a.date).getTime();
          const tB = new Date(b.date).getTime();
          return dateSort === "asc" ? tA - tB : tB - tA;
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
    if (taskPageId)
      localStorage.setItem(`task-items-${taskPageId}`, JSON.stringify(next));
  };

  const addTask = () => {
    if (!taskPageId || !title.trim() || !date) return;
    persistTasks([
      { id: Date.now(), title: title.trim(), completed: false, date, priority },
      ...tasks,
    ]);
    setTitle("");
    setDate("");
  };

  const updateTask = (task: Task) =>
    persistTasks(tasks.map((t) => (t.id === task.id ? task : t)));

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
    setEditDate(task.date);
    setEditPriority(task.priority);
  };

  const saveEditedTask = (task: Task) => {
    if (!editText.trim() || !editDate) return;
    updateTask({
      ...task,
      title: editText.trim(),
      date: editDate,
      priority: editPriority,
    });
    setEditingId(null);
  };

  const toggleTask = (task: Task) =>
    updateTask({ ...task, completed: !task.completed });

  const deleteTask = (id: number) => {
    persistTasks(tasks.filter((t) => t.id !== id));
    const next = { ...detailsById };
    delete next[id];
    setDetailsById(next);
    if (taskPageId)
      localStorage.setItem(`task-details-${taskPageId}`, JSON.stringify(next));
  };

  const openDetailsSlider = (taskId: number) => {
    setOpenDetailsTaskId(taskId);
    setDetailsDraft(detailsById[taskId] ?? "<p>Add details...</p>");
  };

  const saveDetails = () => {
    if (openDetailsTaskId === null || !taskPageId) return;
    const updated = { ...detailsById, [openDetailsTaskId]: detailsDraft };
    setDetailsById(updated);
    localStorage.setItem(`task-details-${taskPageId}`, JSON.stringify(updated));
    setOpenDetailsTaskId(null);
  };

  const savePageTitle = () => {
    if (!taskPageId) return;
    const next = pageTitleInput.trim();
    if (!next) return;
    try {
      const s = localStorage.getItem(TASK_NAV_PAGES_KEY);
      const pages = s ? (JSON.parse(s) as TaskNavPage[]) : [];
      localStorage.setItem(
        TASK_NAV_PAGES_KEY,
        JSON.stringify(
          pages.map((p) => (p.id === taskPageId ? { ...p, name: next } : p)),
        ),
      );
      window.dispatchEvent(new Event("task-pages-updated"));
      setIsRenamingPage(false);
    } catch {
      setIsRenamingPage(false);
    }
  };

  const repeatTasks = (days: number) => {
    const newTasks: Task[] = [];
    selectedTasks.forEach((id) => {
      const orig = tasks.find((t) => t.id === id);
      if (!orig) return;
      for (let i = 1; i <= days; i++) {
        newTasks.push({
          ...orig,
          id: Date.now() + i + Math.random(),
          completed: false,
          date: new Date(new Date(orig.date).getTime() + i * 86400000)
            .toISOString()
            .split("T")[0],
        });
      }
    });
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
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!taskPageId) {
    return (
      <>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: "var(--color-surface)",
            border: "1.5px dashed var(--color-border)",
            borderRadius: 20,
            padding: 48,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "color-mix(in srgb, var(--color-primary) 12%, transparent)",
              border:
                "1.5px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            <LayoutList size={28} color="var(--color-primary)" />
          </div>
          <p
            style={{
              color: "var(--color-foreground-muted)",
              fontSize: 16,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            Use the{" "}
            <strong style={{ color: "var(--color-foreground)" }}>+</strong> icon
            beside Tasks to create and open a new page.
          </p>
        </div>

        {user?.id && <AIChat userId={user.id} mode="floating" />}
      </>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 80 }}>
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 24 }}>
          {isRenamingPage ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Input
                value={pageTitleInput}
                onChange={(e) => setPageTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && savePageTitle()}
                placeholder="Page title"
                autoFocus
                style={{ fontSize: 22, fontWeight: 800, minWidth: 220 }}
              />
              <Button onClick={savePageTitle}>
                <Save size={14} /> Save
              </Button>
              <Button variant="ghost" onClick={() => setIsRenamingPage(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(22px, 5vw, 32px)",
                  fontWeight: 900,
                  margin: 0,
                  color: "var(--color-foreground)",
                  letterSpacing: "-0.02em",
                }}
              >
                {currentPage?.name ?? "Task Page"}
              </h1>
              <button
                onClick={() => {
                  setPageTitleInput(currentPage?.name ?? "");
                  setIsRenamingPage(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  background:
                    "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
                  padding: "5px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <Pencil size={12} /> Rename
              </button>
            </div>
          )}

          {/* Stat pills */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            {[
              {
                icon: <LayoutList size={12} />,
                label: `${stats.total} tasks`,
                token: "primary",
              },
              {
                icon: <CheckCircle2 size={12} />,
                label: `${stats.done} done`,
                token: "success",
              },
              {
                icon: <AlertCircle size={12} />,
                label: `${stats.urgent} urgent`,
                token: "error",
              },
            ].map(({ icon, label, token }) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: `var(--color-${token})`,
                  background: `color-mix(in srgb, var(--color-${token}) 10%, transparent)`,
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: `1px solid color-mix(in srgb, var(--color-${token}) 25%, transparent)`,
                }}
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Add Task ── */}
        <Card style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-foreground-muted)",
              marginBottom: 12,
            }}
          >
            New Task
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="What needs to be done?"
              style={{ flex: "1 1 200px" }}
            />
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="dd-mm-yyyy"
            />
            <Dropdown
              value={priority}
              options={PRIORITY_OPTIONS}
              onChange={(next) => setPriority(next as Task["priority"])}
              style={{ minWidth: 138 }}
            />
            <Button onClick={addTask} disabled={!title.trim() || !date}>
              <Plus size={17} /> Add Task
            </Button>
          </div>
        </Card>

        {/* ── Controls ── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 160px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-foreground-muted)",
                pointerEvents: "none",
              }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            options={PRIORITY_FILTER_OPTIONS}
            onChange={setPriorityFilter}
            style={{ minWidth: 160 }}
          />

          <Dropdown
            value={dateSort}
            options={DATE_SORT_OPTIONS}
            onChange={setDateSort}
            style={{ minWidth: 152 }}
          />

          <ViewToggle value={viewMode} onChange={setViewMode} />

          <Button
            variant="ghost"
            onClick={() =>
              selectedTasks.length === filteredTasks.length
                ? setSelectedTasks([])
                : setSelectedTasks(filteredTasks.map((t) => t.id))
            }
            style={{ fontSize: 12, whiteSpace: "nowrap" }}
          >
            <CheckCheck size={14} />
            {filteredTasks.length > 0 &&
            selectedTasks.length === filteredTasks.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>

        {/* ── Bulk actions ── */}
        <BulkBar
          count={selectedTasks.length}
          onRepeat={repeatTasks}
          onDelete={() => {
            persistTasks(tasks.filter((t) => !selectedTasks.includes(t.id)));
            setSelectedTasks([]);
          }}
        />

        {/* ── All view ── */}
        {viewMode === "all" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredTasks.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "56px 0",
                  color: "var(--color-foreground-muted)",
                  fontSize: 15,
                }}
              >
                <Clock
                  size={32}
                  style={{
                    margin: "0 auto 12px",
                    display: "block",
                    opacity: 0.4,
                  }}
                />
                No tasks found
              </div>
            )}
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                {...taskCardProps}
                isSelected={selectedTasks.includes(task.id)}
                onSelect={() => toggleSelectTask(task.id)}
              />
            ))}
          </div>
        )}

        {/* ── Grouped views ── */}
        {viewMode !== "all" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {groups.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "56px 0",
                  color: "var(--color-foreground-muted)",
                  fontSize: 15,
                }}
              >
                <Clock
                  size={32}
                  style={{
                    margin: "0 auto 12px",
                    display: "block",
                    opacity: 0.4,
                  }}
                />
                No tasks found
              </div>
            )}
            {groups.map(({ key, tasks: groupedTasks }) => (
              <GroupCard
                key={key}
                groupKey={key}
                tasks={groupedTasks}
                isOpen={expandedGroups.has(key)}
                onToggle={() => toggleGroup(key)}
                selectedTasks={selectedTasks}
                taskCardProps={taskCardProps}
                onSelectTask={toggleSelectTask}
              />
            ))}
          </div>
        )}

        {/* ── Details Slider ── */}
        <DetailsSlider
          task={tasks.find((t) => t.id === openDetailsTaskId)}
          draft={detailsDraft}
          isOpen={openDetailsTaskId !== null}
          onClose={() => setOpenDetailsTaskId(null)}
          onDraftChange={setDetailsDraft}
          onSave={saveDetails}
        />
      </div>

      {user?.id && (
        <AIChat
          userId={user.id}
          mode="floating"
          onAddTasks={(generated) => {
            if (!taskPageId) return;
            persistTasks([...generated, ...tasks]);
          }}
        />
      )}
    </>
  );
}
