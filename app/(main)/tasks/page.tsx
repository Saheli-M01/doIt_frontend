"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { X, Plus, Pencil, CalendarDays, Flag } from "lucide-react";
import TaskEditor from "../../components/TaskEditor";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  date: string;
  priority: "low" | "medium" | "high";
};

type TaskNavPage = {
  id: string;
  name: string;
};

const TASK_NAV_PAGES_KEY = "task-nav-pages";

export default function TasksPage() {
  const params = useParams<{ taskPageId?: string }>();
  const taskPageId = params?.taskPageId;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [priority, setPriority] = useState("medium");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateSort, setDateSort] = useState("desc");
  const [isRenamingPage, setIsRenamingPage] = useState(false);
  const [pageTitleInput, setPageTitleInput] = useState("");
  const [openDetailsTaskId, setOpenDetailsTaskId] = useState<number | null>(
    null,
  );
  const [detailsDraft, setDetailsDraft] = useState("<p>Add details...</p>");
  const [detailsById, setDetailsById] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState<TaskNavPage | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  // Reload tasks, details, and page name whenever the page ID changes
  // OR when the sidebar renames the page (task-pages-updated event)
  useEffect(() => {
    if (!taskPageId) {
      setTasks([]);
      setDetailsById({});
      setCurrentPage(null);
      return;
    }

    const load = () => {
      try {
        const storedTasks = localStorage.getItem(`task-items-${taskPageId}`);
        setTasks(storedTasks ? (JSON.parse(storedTasks) as Task[]) : []);
      } catch {
        setTasks([]);
      }
      try {
        const storedDetails = localStorage.getItem(`task-details-${taskPageId}`);
        setDetailsById(
          storedDetails ? (JSON.parse(storedDetails) as Record<number, string>) : {},
        );
      } catch {
        setDetailsById({});
      }
      try {
        const storedPages = localStorage.getItem(TASK_NAV_PAGES_KEY);
        const pages = storedPages ? (JSON.parse(storedPages) as TaskNavPage[]) : [];
        setCurrentPage(pages.find((p) => p.id === taskPageId) ?? null);
      } catch {
        setCurrentPage(null);
      }
    };

    load();
    window.addEventListener("task-pages-updated", load);
    return () => window.removeEventListener("task-pages-updated", load);
  }, [taskPageId]);

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) =>
      priorityFilter === "all" ? true : t.priority === priorityFilter,
    )
    .sort((a, b) => {
      if (dateSort === "none") return 0;
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return dateSort === "asc" ? timeA - timeB : timeB - timeA;
    });

  const persistTasks = (next: Task[]) => {
    setTasks(next);
    if (taskPageId) {
      localStorage.setItem(`task-items-${taskPageId}`, JSON.stringify(next));
    }
  };

  //  Add task
  const addTask = async () => {
    if (!taskPageId || !title || !date) return;

    const nextTask: Task = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      date,
      priority: priority as Task["priority"],
    };

    persistTasks([nextTask, ...tasks]);
    setTitle("");
    setDate("");
  };
  const updateTask = async (task: Task) => {
    const next = tasks.map((t) => (t.id === task.id ? task : t));
    persistTasks(next);
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
    setEditDate(task.date);
    setEditPriority(task.priority);
  };

  const saveEditedTask = async (task: Task) => {
    if (!editText.trim() || !editDate) return;
    await updateTask({
      ...task,
      title: editText.trim(),
      date: editDate,
      priority: editPriority,
    });
    setEditingId(null);
  };
  // Toggle complete
  const toggleTask = async (task: Task) => {
    await updateTask({ ...task, completed: !task.completed });
  };

  // Delete task
  const deleteTask = async (id: number) => {
    persistTasks(tasks.filter((task) => task.id !== id));

    const nextDetails = { ...detailsById };
    delete nextDetails[id];
    setDetailsById(nextDetails);
    if (taskPageId) {
      localStorage.setItem(
        `task-details-${taskPageId}`,
        JSON.stringify(nextDetails),
      );
    }
  };

  const openDetailsSlider = (taskId: number) => {
    setOpenDetailsTaskId(taskId);
    setDetailsDraft(detailsById[taskId] ?? "<p>Add details...</p>");
  };

  const closeDetailsSlider = () => {
    setOpenDetailsTaskId(null);
  };

  const saveDetails = () => {
    if (openDetailsTaskId === null || !taskPageId) return;

    const updated = {
      ...detailsById,
      [openDetailsTaskId]: detailsDraft,
    };

    setDetailsById(updated);
    localStorage.setItem(`task-details-${taskPageId}`, JSON.stringify(updated));
    setOpenDetailsTaskId(null);
  };

  const detailsTask = tasks.find((task) => task.id === openDetailsTaskId);

  const savePageTitle = () => {
    if (!taskPageId) return;
    const nextTitle = pageTitleInput.trim();
    if (!nextTitle) return;

    try {
      const stored = localStorage.getItem(TASK_NAV_PAGES_KEY);
      const pages = stored ? (JSON.parse(stored) as TaskNavPage[]) : [];
      const updatedPages = pages.map((page) =>
        page.id === taskPageId ? { ...page, name: nextTitle } : page,
      );
      localStorage.setItem(TASK_NAV_PAGES_KEY, JSON.stringify(updatedPages));
      window.dispatchEvent(new Event("task-pages-updated"));
      setIsRenamingPage(false);
    } catch {
      setIsRenamingPage(false);
    }
  };

  if (!taskPageId) {
    return (
      <div className="min-h-[50vh] rounded-xl border border-border bg-surface p-8 flex items-center justify-center">
        <p className="text-foreground-muted text-lg">
          Use the plus icon beside Tasks to create and open a new page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        {isRenamingPage ? (
          <>
            <input
              value={pageTitleInput}
              onChange={(e) => setPageTitleInput(e.target.value)}
              className="border border-border bg-surface text-foreground p-2 rounded"
              placeholder="Page title"
              autoFocus
            />
            <button
              onClick={savePageTitle}
              className="px-3 py-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Save Title
            </button>
            <button
              onClick={() => setIsRenamingPage(false)}
              className="px-3 py-2 rounded border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">
              {currentPage?.name ?? "Task Page"}
            </h1>
            <button
              onClick={() => {
                setPageTitleInput(currentPage?.name ?? "");
                setIsRenamingPage(true);
              }}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-light transition-colors"
            >
              <Pencil size={16} />
              Rename Page
            </button>
          </>
        )}
      </div>

      {/* Add Task */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task..."
          className="border border-border bg-surface text-foreground p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-border bg-surface text-foreground p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border border-border bg-surface text-foreground p-2 rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          onClick={addTask}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      <div className="mb-6 flex gap-3 flex-wrap">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-border bg-surface text-foreground p-2 rounded"
        >
          <option value="all">All priorities</option>
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>

        <select
          value={dateSort}
          onChange={(e) => setDateSort(e.target.value)}
          className="border border-border bg-surface text-foreground p-2 rounded"
        >
          <option value="desc">Date: newest first</option>
          <option value="asc">Date: oldest first</option>
          <option value="none">Date: no sort</option>
        </select>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tasks..."
        className="border border-border bg-surface text-foreground p-2 rounded w-full mb-4"
      />
      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 && (
          <p className="text-foreground-muted text-center py-8">
            No tasks found
          </p>
        )}

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-surface border border-border p-4 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
              />

              <div className="flex-1">
                {editingId === task.id ? (
                  <div className="space-y-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      placeholder="Task name"
                      className="border border-border bg-background text-foreground p-1 rounded w-full"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="border border-border bg-background text-foreground p-1 rounded"
                      />
                      <select
                        value={editPriority}
                        onChange={(e) =>
                          setEditPriority(e.target.value as Task["priority"])
                        }
                        className="border border-border bg-background text-foreground p-1 rounded"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <button
                        onClick={() => void saveEditedTask(task)}
                        className="px-2 py-1 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 rounded border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`font-medium ${
                      task.completed
                        ? "line-through text-foreground-muted"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-foreground">
                    <Flag size={14} />
                    {task.priority}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-foreground">
                    <CalendarDays size={14} />
                    {task.date}
                  </span>
                  <button
                    onClick={() => startEditing(task)}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-light transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => openDetailsSlider(task.id)}
                    className="text-primary hover:text-primary-light transition-colors"
                  >
                    Add Details
                  </button>
                </div>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 p-2 rounded-full transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-110"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          openDetailsTaskId !== null
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Close details panel"
          onClick={closeDetailsSlider}
          className="absolute inset-0 bg-black/30"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-xl bg-surface text-foreground border-l border-border shadow-2xl p-5 transition-transform duration-300 ${
            openDetailsTaskId !== null ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Task Details</h2>
              {detailsTask && (
                <p className="text-sm text-foreground-muted mt-1">
                  {detailsTask.title}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={closeDetailsSlider}
              className="text-red-500 p-2 rounded-full transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-110"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <TaskEditor value={detailsDraft} onChange={setDetailsDraft} />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={saveDetails}
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Save Details
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
