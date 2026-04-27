import { Button } from "@/components/ui/button";

type ActionsProps = {
  loading: boolean;
  prompt: string;
  onGenerate: () => void;
  onConvert: () => void;
  hasTasks: boolean;
  converted: boolean;
  usageLimitReached: boolean;
  converting?: boolean;
};

export default function Actions({
  loading,
  prompt,
  onGenerate,
  onConvert,
  hasTasks,
  converted,
  usageLimitReached,
  converting = false,
}: ActionsProps) {
  return (
    <div className="flex gap-4 items-center">
      <Button
        data-tour="ai-generate-plan"
        onClick={onGenerate}
        disabled={loading || !prompt || usageLimitReached}
        style={{
          background: "var(--color-primary)",
          boxShadow:
            "0 2px 12px color-mix(in srgb, var(--color-primary) 25%, transparent)",
          cursor:
            loading || !prompt || usageLimitReached ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Plan"}
      </Button>

      {hasTasks && (
        <Button
          data-tour="ai-convert-tasks"
          onClick={onConvert}
          disabled={loading || converted || converting}
          style={{
            background: "var(--color-foreground)",
            color: "var(--color-background)",
            cursor: loading || converted || converting ? "not-allowed" : "pointer",
          }}
        >
          {converting ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Converting...
            </span>
          ) : converted ? (
            "Added..."
          ) : (
            "Convert to Tasks"
          )}
        </Button>
      )}
    </div>
  );
}
