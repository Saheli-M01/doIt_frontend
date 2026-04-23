import { ScrollArea } from "@/components/ui/scroll-area";

type TaskItem = {
  title: string;
  priority: "low" | "medium" | "high";
  date: string;
};

type TaskListProps = {
  tasks: TaskItem[];
  loading: boolean;
};

const priorityConfig = {
  high: {
    label: "High",
    color: "var(--color-error)",
    bg: "color-mix(in srgb, var(--color-error) 12%, transparent)",
    border: "var(--color-error)",
  },
  medium: {
    label: "Medium",
    color: "var(--color-warning)",
    bg: "color-mix(in srgb, var(--color-warning) 12%, transparent)",
    border: "var(--color-warning)",
  },
  low: {
    label: "Low",
    color: "var(--color-success)",
    bg: "color-mix(in srgb, var(--color-success) 12%, transparent)",
    border: "var(--color-success)",
  },
};

function PulsingLine({ delay }: { delay: number }) {
  return (
    <div
      className="h-px w-full animate-pulse rounded"
      style={{
        background: "var(--color-border)",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

function ThinkingIndicator() {
  return (
    <div className="py-6 flex flex-col items-start gap-3 px-1">
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[11px] uppercase tracking-widest animate-pulse"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          processing
        </span>
        <span
          className="font-mono text-[11px] animate-pulse"
          style={{ color: "var(--color-primary)" }}
        >
          ▌
        </span>
      </div>
      <div className="w-full flex flex-col gap-2">
        <PulsingLine delay={0} />
        <PulsingLine delay={200} />
        <PulsingLine delay={400} />
      </div>
      <div className="flex gap-1 items-center">
        {[0, 180, 360].map((d) => (
          <span
            key={d}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              background: "var(--color-primary)",
              animationDelay: `${d}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TaskList({ tasks, loading }: TaskListProps) {
  const isEmpty = !loading && Array.isArray(tasks) && tasks.length === 0;

  return (
    <div
      className="rounded-none"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-background)",
      }}
    >
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          background: "var(--color-foreground)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          generated_tasks
        </span>
        {Array.isArray(tasks) && tasks.length > 0 && (
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--color-primary-light)" }}
          >
            {tasks.length} items
          </span>
        )}
      </div>

      <ScrollArea className="h-52">
        <div className="p-3">
          {loading && <ThinkingIndicator />}

          {isEmpty && (
            <div className="h-40 flex flex-col items-center justify-center gap-2 select-none">
              <span
                className="font-mono text-[32px]"
                style={{ color: "var(--color-border)" }}
              >
                []
              </span>
              <p
                className="font-mono text-[11px] text-center leading-relaxed"
                style={{ color: "var(--color-foreground-muted)" }}
              >
                no output yet
                <br />
                <span style={{ color: "var(--color-border)" }}>
                  run generate to see tasks
                </span>
              </p>
            </div>
          )}

          {!loading &&
            Array.isArray(tasks) &&
            tasks.map((t, i) => {
              const key = (t.priority || "low").toLowerCase().trim();

              const cfg =
                key === "high"
                  ? priorityConfig.high
                  : key === "medium"
                    ? priorityConfig.medium
                    : priorityConfig.low;
              return (
                <div
                  key={i}
                  className="group flex items-start gap-3 py-2.5 transition-colors duration-100 hover:bg-muted/60"
                  style={{
                    borderBottom:
                      i < tasks.length - 1
                        ? "1px dashed var(--color-border)"
                        : "none",
                    paddingLeft: "4px",
                    paddingRight: "4px",
                  }}
                >
                  {/* Index number */}
                  <span
                    className="font-mono text-[11px] mt-0.5 w-4 shrink-0 select-none"
                    style={{ color: "var(--color-foreground-muted)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Title */}
                  <span
                    className="flex-1 font-mono text-[13px] leading-snug transition-colors duration-100"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {t.title}
                  </span>

                  {/* Right side: date + priority */}
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <span className="font-mono text-[12px] font-bold px-1.5 py-0.5">
                      {" "}
                      {t.date &&
                        !isNaN(new Date(t.date).getTime()) &&
                        new Date(t.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                    </span>

                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-0.5"
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        color: cfg.color,
                        borderRadius: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
}
