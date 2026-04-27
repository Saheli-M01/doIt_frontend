import { Textarea } from "@/components/ui/textarea";

type PromptInputProps = {
  prompt: string;
  setPrompt: (value: string) => void;
  usageCount: number;
  usageWarning: string;
  usageLimitReached: boolean;
};

export default function PromptInput({
  prompt,
  setPrompt,
  usageCount,
  usageWarning,
  usageLimitReached,
}: PromptInputProps) {
  const promptExamples = [
    "Prepare for DBMS interview in 3 days. I have 2 hours daily. Prioritize SQL and normalization.",
    "Plan my week for React revision and portfolio updates. I can study Mon-Fri after 7 PM.",
    "Break down my startup launch tasks for the next 10 days. Focus on MVP, landing page, and outreach.",
  ];

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        Usage: {usageCount}/5
      </p>

      {usageWarning && (
        <p className="text-xs mb-2" style={{ color: "var(--color-error)" }}>
          {usageWarning}
        </p>
      )}

      <Textarea
        data-tour="ai-prompt-input"
        placeholder={
          usageLimitReached
            ? "Usage limit reached. You can't access AI planning now."
            : "e.g. Learn DBMS within 3 days"
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={usageLimitReached}
        className={usageLimitReached ? "opacity-80" : undefined}
      />

      <div className="mt-3 rounded-lg border border-border bg-muted/25 p-3">
        <p className="text-xs font-semibold text-foreground mb-1.5">
          How to write better prompts
        </p>
        <p className="text-xs text-foreground-muted">
          Include: goal + timeline + constraints.
        </p>
        <p className="text-xs text-foreground-muted mb-2">
          Example format: "Plan [goal] in [time] with [daily
          availability/priority]".
        </p>

        <div className="flex flex-col gap-1.5">
          {promptExamples.map((example) => (
            <button
              key={example}
              type="button"
              disabled={usageLimitReached}
              onClick={() => setPrompt(example)}
              className="text-left text-[11px] px-2 py-1.5 rounded border border-border/70 bg-surface hover:bg-muted transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>

        {usageLimitReached && (
          <p
            className="text-[11px] mt-2"
            style={{ color: "var(--color-foreground-muted)" }}
          >
            Planner is temporarily locked because usage is exhausted.
          </p>
        )}
      </div>
    </div>
  );
}
