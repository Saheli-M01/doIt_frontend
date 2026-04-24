import { Button } from "@/components/ui/button";

type ActionsProps = {
  loading: boolean;
  prompt: string;
  onGenerate: () => void;
  onConvert: () => void;
  hasTasks: boolean;
  converted: boolean;
  usageLimitReached: boolean;
};

export default function Actions({
  loading,
  prompt,
  onGenerate,
  onConvert,
  hasTasks,
  converted,
  usageLimitReached,
}: ActionsProps) {
  return (
    <div className="flex gap-4 items-center">
      <Button
        onClick={onGenerate}
        disabled={loading || !prompt || usageLimitReached}
        style={{
          background: "var(--color-primary)",
          boxShadow:
            "0 2px 12px color-mix(in srgb, var(--color-primary) 25%, transparent)",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Plan"}
      </Button>

      {hasTasks && (
        <Button
          onClick={onConvert}
          disabled={loading || converted}
          style={{
            background: "var(--color-foreground)",
            color: "var(--color-background)",
            cursor: "pointer",
          }}
        >
          {converted ? "Added..." : "Convert to Tasks"}
        </Button>
      )}
    </div>
  );
}
