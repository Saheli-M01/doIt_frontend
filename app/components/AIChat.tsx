"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BotMessageSquare } from "lucide-react";

type Priority = "low" | "medium" | "high";

type GeneratedTask = {
  title: string;
};

type CreatedTask = {
  id: number;
  title: string;
  completed: boolean;
  date: string;
  priority: Priority;
};

type AIChatProps = {
  userId: number | string;
  onAddTasks?: (tasks: CreatedTask[]) => void;
  mode?: "floating" | "sidebar";
};

export default function AIChat({
  userId,
  onAddTasks,
  mode = "floating",
}: AIChatProps) {
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiTasks, setAiTasks] = useState<GeneratedTask[]>([]);

  const generatePlan = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/ai/generate/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        },
      );
      if (!res.ok) {
        const err = await res.text();
        alert(err);
        setLoading(false);
        return;
      }

      const text = await res.text();
      const cleaned = text.replace(/```json|```/g, "").trim();

      try {
        const parsed = JSON.parse(cleaned) as unknown;
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter((item) => typeof item === "object" && item !== null && "title" in item)
            .map((item) => ({ title: String((item as { title: unknown }).title) }))
            .filter((item) => item.title.trim().length > 0);
          setAiTasks(normalized);
        } else {
          throw new Error("AI response is not an array");
        }
      } catch {
        console.error("Invalid AI response:", cleaned);
        alert("AI returned invalid format");
      }
    } catch {
      alert("AI error");
    }

    setLoading(false);
  };

  const convertToTasks = () => {
    const today = new Date();

    const tasks: CreatedTask[] = aiTasks.map((t, i) => ({
      id: Date.now() + i + Math.random(),
      title: t.title,
      completed: false,
      date: today.toISOString().split("T")[0],
      priority: "medium",
    }));

    onAddTasks?.(tasks);
    setAiTasks([]);
    setPrompt("");
    setOpen(false);
  };

  const trigger =
    mode === "floating" ? (
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-white text-xl shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, #111))",
        }}
        aria-label="Open AI planner"
      >
        <BotMessageSquare />
      </div>
    ) : (
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer w-full rounded-lg border px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-foreground)",
          background: "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))",
        }}
        aria-label="Open AI planner"
      >
        <BotMessageSquare size={16} />
        AI Planner
      </button>
    );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Planner</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Describe what you want to accomplish and generate a task plan.
          </p>

          <Textarea
            placeholder="e.g. Plan DBMS study for 3 days"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <Button onClick={generatePlan} disabled={loading || !prompt}>
            {loading ? "Generating..." : "Generate Plan"}
          </Button>

          <ScrollArea className="h-40 border rounded p-2">
            {loading && (
              <p className="text-sm text-muted-foreground mb-2">Thinking...</p>
            )}
            {!loading && aiTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No tasks yet. Try generating a plan.
              </p>
            )}
            {aiTasks.map((t, i) => (
              <div key={i} className="text-sm py-1 border-b">
                <div className="bg-muted px-2 py-1 rounded mb-1">{t.title}</div>
              </div>
            ))}
          </ScrollArea>

          {aiTasks.length > 0 && (
            <Button
              onClick={convertToTasks}
              className="text-white"
              style={{ background: "var(--color-success)" }}
            >
              Convert to Tasks
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
