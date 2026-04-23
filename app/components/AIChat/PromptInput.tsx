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
        placeholder={
          usageLimitReached
            ? "Usage limit reached. You can't access AI planning now."
            : "e.g. Learn DBMS within 3 days"
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={usageLimitReached}
      />
    </div>
  );
}
