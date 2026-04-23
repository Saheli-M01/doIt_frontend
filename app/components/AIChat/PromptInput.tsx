import { Textarea } from "@/components/ui/textarea";

export default function PromptInput({ prompt, setPrompt, usageCount }: any) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        Usage: {usageCount}/5
      </p>

      <Textarea
        placeholder="e.g. Learn DBMS within 3 days"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
    </div>
  );
}
