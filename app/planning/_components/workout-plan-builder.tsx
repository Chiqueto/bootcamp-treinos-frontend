"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Dumbbell,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createStandaloneWorkoutPlanAction,
  createWorkoutPlanInPeriodizationAction,
} from "@/app/planning/_actions";
import {
  createDraftExercise,
  createInitialWorkoutDays,
  serializeWorkoutDays,
  validateWorkoutPlanDraft,
  type WorkoutPlanDraftDay,
  type WorkoutPlanDraftExercise,
} from "@/app/planning/_lib/workout-plan-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkoutPlanBuilderProps {
  mode: "standalone" | "periodization";
  periodizationId?: string;
}

export function WorkoutPlanBuilder({
  mode,
  periodizationId,
}: WorkoutPlanBuilderProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [activate, setActivate] = useState(false);
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState(createInitialWorkoutDays);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function updateDay(index: number, patch: Partial<WorkoutPlanDraftDay>) {
    setDays((current) =>
      current.map((day, dayIndex) =>
        dayIndex === index ? { ...day, ...patch } : day,
      ),
    );
  }

  function toggleRest(index: number, isRest: boolean) {
    const day = days[index];
    updateDay(index, {
      isRest,
      estimatedDurationInMinutes: isRest
        ? 0
        : Math.max(day.estimatedDurationInMinutes, 45),
      exercises:
        isRest || day.exercises.length > 0
          ? day.exercises
          : [createDraftExercise()],
    });
  }

  function updateExercise(
    dayIndex: number,
    exerciseIndex: number,
    patch: Partial<WorkoutPlanDraftExercise>,
  ) {
    updateDay(dayIndex, {
      exercises: days[dayIndex].exercises.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, ...patch } : exercise,
      ),
    });
  }

  function moveExercise(
    dayIndex: number,
    exerciseIndex: number,
    offset: -1 | 1,
  ) {
    const targetIndex = exerciseIndex + offset;
    if (targetIndex < 0 || targetIndex >= days[dayIndex].exercises.length)
      return;
    const exercises = [...days[dayIndex].exercises];
    [exercises[exerciseIndex], exercises[targetIndex]] = [
      exercises[targetIndex],
      exercises[exerciseIndex],
    ];
    updateDay(dayIndex, { exercises });
  }

  function submit() {
    const validationError = validateWorkoutPlanDraft(
      name,
      days,
      mode === "periodization" ? plannedStartDate : undefined,
      mode === "periodization" ? plannedEndDate : undefined,
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    if (mode === "periodization" && !periodizationId) {
      setError("Periodização inválida.");
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const workoutDays = serializeWorkoutDays(days);
      const result =
        mode === "standalone"
          ? await createStandaloneWorkoutPlanAction({
              name: name.trim(),
              workoutDays,
              activate,
            })
          : await createWorkoutPlanInPeriodizationAction(periodizationId!, {
              name: name.trim(),
              workoutDays,
              plannedStartDate: plannedStartDate || null,
              plannedEndDate: plannedEndDate || null,
              notes: notes.trim() || null,
            });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const destination =
        mode === "standalone"
          ? "/planning"
          : `/planning/periodizations/${periodizationId}`;
      router.push(destination);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Nome do plano *
          <Input
            value={name}
            maxLength={120}
            placeholder="Ex.: Upper / Lower"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        {mode === "standalone" ? (
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={activate}
              onChange={(event) => setActivate(event.target.checked)}
              className="size-5 accent-primary"
            />
            Tornar este meu plano atual
          </label>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Início previsto
                <Input
                  type="date"
                  value={plannedStartDate}
                  onChange={(event) => setPlannedStartDate(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Fim previsto
                <Input
                  type="date"
                  value={plannedEndDate}
                  onChange={(event) => setPlannedEndDate(event.target.value)}
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Notas da etapa
              <textarea
                value={notes}
                rows={3}
                maxLength={1000}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-24 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              />
            </label>
          </>
        )}
      </section>

      <section
        className="flex flex-col gap-3"
        aria-labelledby="workout-days-title"
      >
        <div>
          <h2
            id="workout-days-title"
            className="font-heading text-base font-semibold"
          >
            Dias da semana
          </h2>
          <p className="text-xs text-muted-foreground">
            Marque os descansos e configure os dias de treino.
          </p>
        </div>

        {days.map((day, dayIndex) => (
          <article
            key={day.weekDay}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-sm font-semibold">
                {day.label}
              </h3>
              <label className="flex min-h-11 items-center gap-2 text-xs font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={day.isRest}
                  onChange={(event) =>
                    toggleRest(dayIndex, event.target.checked)
                  }
                  className="size-5 accent-primary"
                />
                Dia de descanso
              </label>
            </div>

            {!day.isRest && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem]">
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Nome do treino
                    <Input
                      value={day.name}
                      onChange={(event) =>
                        updateDay(dayIndex, { name: event.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Duração (min)
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={day.estimatedDurationInMinutes}
                      onChange={(event) =>
                        updateDay(dayIndex, {
                          estimatedDurationInMinutes: Number(
                            event.target.value,
                          ),
                        })
                      }
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={`${day.weekDay}-${exerciseIndex}`}
                      className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-xs font-semibold">
                          <Dumbbell className="size-3.5 text-primary" />
                          Exercício {exerciseIndex + 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            aria-label={`Mover exercício ${exerciseIndex + 1} para cima`}
                            disabled={exerciseIndex === 0 || isPending}
                            onClick={() =>
                              moveExercise(dayIndex, exerciseIndex, -1)
                            }
                            className="flex size-11 items-center justify-center rounded-full hover:bg-accent disabled:opacity-30"
                          >
                            <ArrowUp className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Mover exercício ${exerciseIndex + 1} para baixo`}
                            disabled={
                              exerciseIndex === day.exercises.length - 1 ||
                              isPending
                            }
                            onClick={() =>
                              moveExercise(dayIndex, exerciseIndex, 1)
                            }
                            className="flex size-11 items-center justify-center rounded-full hover:bg-accent disabled:opacity-30"
                          >
                            <ArrowDown className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remover exercício ${exerciseIndex + 1}`}
                            disabled={isPending}
                            onClick={() =>
                              updateDay(dayIndex, {
                                exercises: day.exercises.filter(
                                  (_, index) => index !== exerciseIndex,
                                ),
                              })
                            }
                            className="flex size-11 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      <label className="flex flex-col gap-1.5 text-xs font-medium">
                        Nome
                        <Input
                          value={exercise.name}
                          placeholder="Ex.: Agachamento"
                          onChange={(event) =>
                            updateExercise(dayIndex, exerciseIndex, {
                              name: event.target.value,
                            })
                          }
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <label className="flex flex-col gap-1.5 text-xs font-medium">
                          Aquecimento
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={exercise.warmupSets ?? 0}
                            onChange={(event) =>
                              updateExercise(dayIndex, exerciseIndex, {
                                warmupSets: Math.max(0, Number(event.target.value)),
                              })
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-1.5 text-xs font-medium">
                          Séries válidas
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={exercise.sets}
                            onChange={(event) =>
                              updateExercise(dayIndex, exerciseIndex, {
                                sets: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-1.5 text-xs font-medium">
                          Repetições
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={exercise.reps}
                            onChange={(event) =>
                              updateExercise(dayIndex, exerciseIndex, {
                                reps: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-1.5 text-xs font-medium">
                          Descanso (s)
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={exercise.restTimeInSeconds}
                            onChange={(event) =>
                              updateExercise(dayIndex, exerciseIndex, {
                                restTimeInSeconds: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full"
                    disabled={isPending}
                    onClick={() =>
                      updateDay(dayIndex, {
                        exercises: [...day.exercises, createDraftExercise()],
                      })
                    }
                  >
                    <Plus />
                    Adicionar exercício
                  </Button>
                </div>
              </>
            )}
          </article>
        ))}
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="button"
        className="h-12 w-full rounded-full text-sm font-semibold"
        disabled={isPending}
        onClick={submit}
      >
        {isPending && <LoaderCircle className="animate-spin" />}
        {isPending
          ? "Criando..."
          : mode === "standalone"
            ? "Criar plano"
            : "Criar plano e adicionar etapa"}
      </Button>
    </div>
  );
}
