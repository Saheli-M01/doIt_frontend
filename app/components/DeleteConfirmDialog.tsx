"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        style={{
          background: "var(--color-surface)",
          border: "2px solid var(--color-border)",
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-error) 15%, transparent)",
                border: "1.5px solid color-mix(in srgb, var(--color-error) 30%, transparent)",
              }}
            >
              <AlertTriangle
                size={20}
                style={{ color: "var(--color-error)" }}
              />
            </div>
            <DialogTitle
              className="text-lg font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              {title}
            </DialogTitle>
          </div>
          <DialogDescription
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-foreground-muted)" }}
          >
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row gap-2 sm:gap-2 border-t-0 bg-transparent p-0 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1"
            style={{
              background: "var(--color-surface)",
              border: "1.5px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1"
            style={{
              background: "var(--color-error)",
              color: "white",
              border: "none",
            }}
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
