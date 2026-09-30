"use client";

import type { ReactNode } from "react";
import { LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PlanningConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  destructive?: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PlanningConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  destructive = false,
  isPending,
  onCancel,
  onConfirm,
}: PlanningConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="planning-dialog-title"
        aria-describedby="planning-dialog-description"
        className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2
              id="planning-dialog-title"
              className="font-heading text-base font-semibold text-foreground"
            >
              {title}
            </h2>
            <div
              id="planning-dialog-description"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {description}
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            disabled={isPending}
            onClick={onCancel}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            className="h-11 rounded-full"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <LoaderCircle className="size-4 animate-spin" />}
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
