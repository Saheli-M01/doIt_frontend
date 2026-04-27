"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cpu } from "lucide-react";
import { resolveBackendUserId } from "@/lib/backendUser";

import PromptInput from "./PromptInput";
import TaskList from "./TasksList";
import Actions from "./Actions";

const MAX_USAGE = 5;

type GeneratedTask = {
  title: string;
  priority: "low" | "medium" | "high";
  date: string;
};

type PlanResponse = {
  title?: string;
  tasks?: Array<Partial<GeneratedTask>>;
};

type AIChatProps = {
  userId: string;
  onAddTasks?: (data: { title: string; tasks: GeneratedTask[] }) => void;
  onCreateTaskPage?: (data: { title: string; tasks: GeneratedTask[] }) => void;
  mode?: "floating" | "sidebar";
};

export default function AIChat({
  userId,
  onAddTasks,
  onCreateTaskPage,
  mode = "floating",
}: AIChatProps) {
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiTasks, setAiTasks] = useState<GeneratedTask[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [converted, setConverted] = useState(false);
  const [usageWarning, setUsageWarning] = useState("");
  const [planTitle, setPlanTitle] = useState("");

  const isUsageLimitReached = usageCount >= MAX_USAGE;

  useEffect(() => {
    if (!open) return;

    const syncUsageCount = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored) return;
        const parsed = JSON.parse(stored) as {
          id: string | number;
          name?: string;
          email?: string;
        };

        const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
          /\/$/,
          "",
        );
        const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: parsed.name ?? parsed.email ?? "User",
            email: parsed.email ?? "",
            firebaseUid: String(parsed.id),
          }),
        });

        if (!registerRes.ok) return;
        const backendUser = await registerRes.json();
        const count = Number(backendUser?.aiUsageCount ?? 0);
        setUsageCount(Number.isFinite(count) ? Math.min(MAX_USAGE, count) : 0);
      } catch {
        // Keep UI functional even if usage sync fails.
      }
    };

    void syncUsageCount();
  }, [open]);

  const handleOpenPlanner = () => {
    if (isUsageLimitReached) {
      setUsageWarning(
        "Usage limit reached (5/5). You can't access AI planning now.",
      );
    }
    setOpen(true);
  };

  const generatePlan = async () => {
    setConverted(false);
    if (isUsageLimitReached) {
      setUsageWarning(
        "Usage limit reached (5/5). You can't access AI planning now.",
      );
      return;
    }
    if (!prompt.trim()) return;
    setLoading(true);

    let aiUserId = userId;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          id: string | number;
          name?: string;
          email?: string;
        };
        aiUserId = String(await resolveBackendUserId(parsed));
      }
    } catch {
      aiUserId = userId;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate/${aiUserId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      },
    );

    const text = await res.text();
    if (!res.ok) {
      try {
        const err = JSON.parse(text) as { error?: string; details?: string };
        alert(
          err.details
            ? `${err.error ?? "Request failed"}\n\n${err.details}`
            : (err.error ?? "Request failed"),
        );
      } catch {
        alert(text);
      }
      setLoading(false);
      return;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      alert(text);
      setLoading(false);
      return;
    }

    const parsed = data as PlanResponse | Array<Partial<GeneratedTask>>;
    const rawTasks = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.tasks)
        ? parsed.tasks
        : [];

    const normalizedTasks: GeneratedTask[] = rawTasks
      .filter((task): task is Partial<GeneratedTask> => Boolean(task?.title))
      .map((task) => {
        const priority =
          task.priority === "high" ||
          task.priority === "medium" ||
          task.priority === "low"
            ? task.priority
            : "medium";

        return {
          title: String(task.title ?? "").trim(),
          priority,
          date: task.date ?? "",
        };
      })
      .filter((task) => task.title.length > 0);

    setPlanTitle(Array.isArray(parsed) ? "" : (parsed.title ?? ""));
    setAiTasks(normalizedTasks);
    const nextUsage = Math.min(MAX_USAGE, usageCount + 1);
    setUsageCount(nextUsage);
    if (nextUsage >= MAX_USAGE) {
      setUsageWarning(
        "Usage limit reached (5/5). You can't access AI planning now.",
      );
    } else {
      setUsageWarning("");
    }
    setLoading(false);
  };

  const convertToTasks = () => {
    if (onAddTasks) {
      onAddTasks({
        title: planTitle,
        tasks: aiTasks,
      });
    } else {
      onCreateTaskPage?.({
        title: planTitle,
        tasks: aiTasks,
      });
    }
    setAiTasks([]);
    setPrompt("");
    setOpen(false);
    setConverted(true);
  };

  const trigger =
    mode === "floating" ? (
      <button
        onClick={handleOpenPlanner}
        aria-label="Open AI Planner"
        className="fixed bottom-6 right-6 z-40 group w-14 h-14 rounded-none flex items-center justify-center cursor-pointer transition-all duration-200"
        style={{
          background: "var(--color-surface)",
          border: "2px solid var(--color-border)",
          outline: "2px solid var(--color-background)",
          outlineOffset: "2px",
        }}
      >
        <Cpu
          size={20}
          className="transition-transform duration-300 group-hover:rotate-90"
          style={{ color: "var(--color-primary)" }}
        />
      </button>
    ) : (
      <button
        onClick={handleOpenPlanner}
        className="group cursor-pointer w-full px-3.5 py-2.5 text-sm flex items-center justify-between gap-2 font-mono tracking-tight transition-all duration-150"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 18%, var(--color-surface)), var(--color-surface))",
          border:
            "1px solid color-mix(in srgb, var(--color-primary) 45%, var(--color-border))",
          borderRadius: 10,
          color: "var(--color-foreground)",
          boxShadow:
            "0 6px 18px color-mix(in srgb, var(--color-primary) 22%, transparent)",
        }}
      >
        <span className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--color-primary) 18%, transparent)",
            }}
          >
            <Cpu
              size={14}
              className="transition-transform duration-200 group-hover:rotate-90"
              style={{ color: "var(--color-primary)" }}
            />
          </span>
          <span className="text-[13px] font-semibold">AI Planner</span>
        </span>
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            color: "var(--color-primary)",
            background:
              "color-mix(in srgb, var(--color-primary) 18%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--color-primary) 45%, transparent)",
          }}
        >
          Smart
        </span>
      </button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="sm:max-w-lg p-0 gap-0 rounded-none shadow-none"
        style={{
          background: "var(--color-surface)",
          border: "2px solid var(--color-border)",
          boxShadow:
            "6px 6px 0px color-mix(in srgb, var(--color-foreground) 45%, transparent)",
        }}
      >
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="sr-only">AI Planner</DialogTitle>
          {/* Top label bar */}
          <div
            className="flex items-center justify-between mb-5 pb-4"
            style={{ borderBottom: "1px dashed var(--color-border)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 flex items-center justify-center"
                style={{ background: "var(--color-foreground)" }}
              >
                <Cpu size={13} style={{ color: "var(--color-primary)" }} />
              </div>
              <span
                className="font-mono text-[13px] font-medium tracking-tight"
                style={{ color: "var(--color-foreground)" }}
              >
                AI_PLANNER
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "var(--color-success)" }}
              />
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--color-foreground-muted)" }}
              >
                ready
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 flex flex-col gap-4">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            usageCount={usageCount}
            usageWarning={usageWarning}
            usageLimitReached={isUsageLimitReached}
          />
          <Actions
            loading={loading}
            prompt={prompt}
            onGenerate={generatePlan}
            onConvert={convertToTasks}
            hasTasks={aiTasks.length > 0}
            converted={converted}
            usageLimitReached={isUsageLimitReached}
          />
          <TaskList tasks={aiTasks} loading={loading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
