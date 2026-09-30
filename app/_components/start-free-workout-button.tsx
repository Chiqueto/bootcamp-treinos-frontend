"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startFreeWorkoutAction } from "../workout-sessions/[sessionId]/_actions";

interface StartFreeWorkoutButtonProps {
  hasActiveSession?: boolean;
}

export function StartFreeWorkoutButton({
  hasActiveSession = false,
}: StartFreeWorkoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStart = () => {
    if (hasActiveSession || isPending) return;
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await startFreeWorkoutAction();
      } catch (err: unknown) {
        const msg = (err as Error)?.message || "";
        if (msg.includes("NEXT_REDIRECT")) {
          throw err;
        }
        setErrorMessage(msg || "Erro ao iniciar treino avulso");
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleStart}
        disabled={hasActiveSession || isPending}
        title={
          hasActiveSession
            ? "Finalize o treino em andamento antes de iniciar outro"
            : undefined
        }
        className="w-full rounded-2xl border-dashed border-border py-5 font-heading text-sm font-semibold hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Iniciando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            Treino avulso
          </span>
        )}
      </Button>
      {errorMessage && (
        <p className="text-xs text-destructive text-center font-heading font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
