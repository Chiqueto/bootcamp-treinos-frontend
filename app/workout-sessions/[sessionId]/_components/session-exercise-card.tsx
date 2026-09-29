"use client";

import { useMemo, useState, useTransition } from "react";
import { Dumbbell, Plus, Zap } from "lucide-react";

import type {
  GetWorkoutSession200SessionExercisesItem,
  GetWorkoutSession200SessionExercisesItemSetsItem,
} from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";

import { createWorkoutSetAction } from "../_actions";
import { WorkoutSetRow } from "./workout-set-row";

interface SessionExerciseCardProps {
  sessionId: string;
  exercise: GetWorkoutSession200SessionExercisesItem;
  isReadOnly: boolean;
  onError: (errorMsg: string) => void;
}

export function SessionExerciseCard({
  sessionId,
  exercise,
  isReadOnly,
  onError,
}: SessionExerciseCardProps) {
  // Inicializa a lista local de séries
  const [sets, setSets] = useState<
    GetWorkoutSession200SessionExercisesItemSetsItem[]
  >(() => [...exercise.sets].sort((a, b) => a.order - b.order));

  // Detecta se o exercício é naturalmente baseado em tempo (ex: pranchas, isometrias)
  const isDefaultDuration = useMemo(() => {
    const nameLower = exercise.exerciseNameSnapshot.toLowerCase();
    const hasDurationName =
      nameLower.includes("prancha") ||
      nameLower.includes("isometria") ||
      nameLower.includes("tempo") ||
      nameLower.includes("hold");

    const hasDurationSets = exercise.sets.some(
      (s) => s.durationInSeconds !== null && s.durationInSeconds !== undefined,
    );

    return hasDurationName || hasDurationSets;
  }, [exercise]);

  const [mode, setMode] = useState<"reps" | "duration">(
    isDefaultDuration ? "duration" : "reps",
  );

  const [isPending, startTransition] = useTransition();

  // Callback para atualizar uma série no estado local
  const handleUpdateSet = (
    updated: GetWorkoutSession200SessionExercisesItemSetsItem,
  ) => {
    setSets((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
    );
  };

  // Callback para remover uma série do estado local
  const handleDeleteSet = (setId: string) => {
    setSets((prev) => prev.filter((s) => s.id !== setId));
  };

  // Adicionar nova série
  const handleAddSet = () => {
    if (isReadOnly || isPending) return;

    startTransition(async () => {
      const res = await createWorkoutSetAction(sessionId, exercise.id, {
        type: "WORKING",
      });

      if (!res.success) {
        onError(res.error);
      } else {
        const newSet: GetWorkoutSession200SessionExercisesItemSetsItem = {
          id: res.data.id,
          order: res.data.order,
          type: res.data.type,
          weightInGrams: res.data.weightInGrams,
          reps: res.data.reps,
          rir: res.data.rir,
          durationInSeconds: res.data.durationInSeconds,
          notes: res.data.notes,
          completedAt: res.data.completedAt,
        };

        setSets((prev) => [...prev, newSet].sort((a, b) => a.order - b.order));
      }
    });
  };

  // Formatação da prescrição
  const prescriptionText = useMemo(() => {
    const parts: string[] = [];
    if (exercise.plannedSets && exercise.plannedReps) {
      parts.push(`${exercise.plannedSets} séries × ${exercise.plannedReps} reps`);
    } else if (exercise.plannedSets) {
      parts.push(`${exercise.plannedSets} séries planejadas`);
    } else if (exercise.plannedReps) {
      parts.push(`${exercise.plannedReps} reps planejadas`);
    }
    return parts.join(" • ");
  }, [exercise]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      {/* Header do Exercício */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-[11px] font-bold text-primary">
              {exercise.order}
            </span>
            <h3 className="font-heading text-base font-bold text-foreground">
              {exercise.exerciseNameSnapshot}
            </h3>
          </div>

          {prescriptionText && (
            <p className="font-heading text-xs text-muted-foreground pl-7">
              {prescriptionText}
            </p>
          )}

          {exercise.plannedRestTimeInSeconds !== null &&
            exercise.plannedRestTimeInSeconds > 0 && (
              <p className="flex items-center gap-1 font-heading text-[11px] text-muted-foreground/80 pl-7">
                <Zap className="size-3 text-amber-500" />
                Descanso: {exercise.plannedRestTimeInSeconds}s
              </p>
            )}
        </div>

        {/* Seletor de Modo: Reps vs Tempo (habilitado apenas se editável) */}
        {!isReadOnly && (
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-[11px] font-heading font-semibold">
            <button
              type="button"
              onClick={() => setMode("reps")}
              className={`rounded-md px-2 py-1 transition-colors ${
                mode === "reps"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reps
            </button>
            <button
              type="button"
              onClick={() => setMode("duration")}
              className={`rounded-md px-2 py-1 transition-colors ${
                mode === "duration"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tempo
            </button>
          </div>
        )}
      </div>

      {exercise.notes && (
        <p className="text-xs text-muted-foreground italic pl-7 border-l-2 border-border/60">
          {exercise.notes}
        </p>
      )}

      {/* Lista de Séries */}
      <div className="flex flex-col gap-2 pt-1">
        {sets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-6 text-center">
            <Dumbbell className="size-6 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs text-muted-foreground">
              Nenhuma série registrada ainda.
            </p>
          </div>
        ) : (
          sets.map((set) => (
            <WorkoutSetRow
              key={set.id}
              sessionId={sessionId}
              set={set}
              mode={mode}
              isReadOnly={isReadOnly}
              onUpdateSet={handleUpdateSet}
              onDeleteSet={handleDeleteSet}
              onError={onError}
            />
          ))
        )}
      </div>

      {/* Botão + Adicionar Série */}
      {!isReadOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddSet}
          disabled={isPending}
          className="mt-1 h-11 w-full rounded-xl border-dashed font-heading text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]"
        >
          <Plus className="mr-1.5 size-4 text-primary" />
          <span>Adicionar série</span>
        </Button>
      )}
    </div>
  );
}
