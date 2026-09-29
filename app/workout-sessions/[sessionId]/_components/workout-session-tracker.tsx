"use client";

import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Dumbbell,
  X,
} from "lucide-react";
import dayjs from "dayjs";

import type { GetWorkoutSession200 } from "@/app/_lib/api/fetch-generated";

import { SessionExerciseCard } from "./session-exercise-card";

interface WorkoutSessionTrackerProps {
  session: GetWorkoutSession200;
}

export function WorkoutSessionTracker({ session }: WorkoutSessionTrackerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isReadOnly = !!session.completedAt;
  const startedAtFormatted = dayjs(session.startedAt).format(
    "DD/MM/YYYY [às] HH:mm",
  );
  const completedAtFormatted = session.completedAt
    ? dayjs(session.completedAt).format("DD/MM/YYYY [às] HH:mm")
    : null;

  const exercises = [...session.sessionExercises].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Toast / Banner de Erro Inline (Preserva dados do formulário) */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <p className="font-heading text-xs font-semibold">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="rounded-md p-1 hover:bg-destructive/20"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>
      )}

      {/* Card de Informações e Status da Sessão */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            ID #{session.id.slice(0, 8)}
          </span>

          {isReadOnly ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold text-primary">
              <CheckCircle2 className="size-3.5" />
              Treino Concluído
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Em Andamento
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Iniciado em: {startedAtFormatted}</span>
          </div>

          {completedAtFormatted && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>Finalizado em: {completedAtFormatted}</span>
            </div>
          )}
        </div>

        {isReadOnly && (
          <div className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
            Esta sessão foi finalizada e os registros estão em modo somente leitura.
          </div>
        )}
      </div>

      {/* Seção de Exercícios */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Dumbbell className="size-5 text-primary" />
            Exercícios ({exercises.length})
          </h2>
        </div>

        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
            <Dumbbell className="size-8 text-muted-foreground/60 mb-2" />
            <p className="font-heading text-sm font-semibold text-foreground">
              Dia de descanso
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Não há exercícios prescritos para esta sessão.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {exercises.map((exercise) => (
              <SessionExerciseCard
                key={exercise.id}
                sessionId={session.id}
                exercise={exercise}
                isReadOnly={isReadOnly}
                onError={(msg) => setErrorMessage(msg)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
