"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cpu } from "lucide-react";

import PromptInput from "./PromptInput";
import TaskList from "./TasksList";
import Actions from "./Actions";

type GeneratedTask = {
  title: string;
  priority: "low" | "medium" | "high";
  date: string;
};

type AIChatProps = {
  userId: string;
  onAddTasks?: (tasks: GeneratedTask[]) => void;
  onCreateTaskPage?: (tasks: GeneratedTask[]) => void;
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
  const [usageCount] = useState(0);
  const [converted, setConverted] = useState(false);

  const generatePlan = async () => {
    setConverted(false);
    if (!prompt.trim()) return;
    setLoading(true);

    const res = await fetch(`http://localhost:8080/api/ai/generate/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert(text);
      setLoading(false);
      return;
    }

    setAiTasks(data);
    setLoading(false);
  };

  const convertToTasks = () => {
    const tasks = aiTasks.map((t, i) => ({
      id: Date.now() + i,
      title: t.title,
      completed: false,
      date: t.date,
      priority: t.priority,
    }));
    if (onAddTasks) {
      onAddTasks(tasks);
    } else {
      onCreateTaskPage?.(tasks);
    }
    setAiTasks([]);
    setPrompt("");
    setOpen(false);
    setConverted(true);
  };

  const trigger =
    mode === "floating" ? (
      <button
        onClick={() => setOpen(true)}
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
        onClick={() => setOpen(true)}
        className="group cursor-pointer w-full px-3 py-2 text-sm flex items-center gap-2 font-mono tracking-tight transition-all duration-150"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 0,
          color: "var(--color-foreground)",
        }}
      >
        <Cpu
          size={14}
          className="transition-transform duration-200 group-hover:rotate-90"
          style={{ color: "var(--color-primary)" }}
        />
        <span className="text-[13px]">AI Planner</span>
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
          />
          <Actions
            loading={loading}
            prompt={prompt}
            onGenerate={generatePlan}
            onConvert={convertToTasks}
            hasTasks={aiTasks.length > 0}
            converted={converted}
          />
          <TaskList tasks={aiTasks} loading={loading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
