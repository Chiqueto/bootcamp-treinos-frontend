"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, Dumbbell, Loader2 } from "lucide-react";

import { LocalDate } from "@/app/_components/local-date";
import type {
  GetExerciseEvolution200,
  GetExerciseEvolution200ItemsItem,
  GetExerciseEvolution200ItemsItemSetsItem,
} from "@/app/_lib/api/fetch-generated";
import { getMuscleGroupLabel } from "@/app/_lib/muscle-labels";
import {
  formatDateOnly,
  formatSetDuration,
  formatWeightInGrams,
  formatWeightKg,
  getHistorySessionTitle,
} from "@/app/_lib/training-formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { loadExerciseEvolutionPage } from "../../../_actions";
import { appendUniqueEvolutionSessions } from "../../../_lib/evolution-data";

export function ExerciseEvolutionDetail({
  initialData,
}: {
  initialData: GetExerciseEvolution200;
}) {
  const [items, setItems] = useState(initialData.items);
  const [nextCursor, setNextCursor] = useState(initialData.nextCursor);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorInFlightRef = useRef<string | null>(null);

  const loadMore = useCallback(async () => {
    const cursor = nextCursor;
    if (
      !cursor ||
      !hasMore ||
      isLoading ||
      cursorInFlightRef.current === cursor
    ) {
      return;
    }

    cursorInFlightRef.current = cursor;
    setIsLoading(true);
    setError(null);
    const response = await loadExerciseEvolutionPage({
      exerciseId: initialData.exercise.id,
      cursor,
    });

    if (response.success) {
      setItems((current) =>
        appendUniqueEvolutionSessions(current, response.data.items),
      );
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
    if (cursorInFlightRef.current === cursor) cursorInFlightRef.current = null;
  }, [hasMore, initialData.exercise.id, isLoading, nextCursor]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 sm:px-6">
      <Link
        href="/stats"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg pr-3 font-heading text-sm text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Evolução
      </Link>

      <header className="mt-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {initialData.exercise.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {initialData.exercise.muscles.map((muscle) => (
            <Badge
              key={`${muscle.muscleGroup}-${muscle.role}`}
              variant={muscle.role === "PRIMARY" ? "default" : "secondary"}
              className="text-[10px]"
            >
              {getMuscleGroupLabel(muscle.muscleGroup)} ·{" "}
              {muscle.role === "PRIMARY" ? "principal" : "secundário"}
            </Badge>
          ))}
        </div>
      </header>

      <LoadPrCard loadPR={initialData.loadPR} hasHistory={items.length > 0} />

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-7 text-center">
          <Dumbbell
            className="mx-auto size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-heading text-base font-semibold text-foreground">
            Você ainda não possui sessões concluídas registradas para este
            exercício.
          </h2>
          <Button asChild variant="outline" className="mt-5 rounded-full">
            <Link href="/history">Ver histórico</Link>
          </Button>
        </div>
      ) : (
        <>
          <ExerciseLoadChart items={items} />

          <section aria-labelledby="exercise-sessions-title" className="mt-7">
            <h2
              id="exercise-sessions-title"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Últimas sessões
            </h2>
            <div className="mt-3 space-y-3">
              {items.map((item) => (
                <ExerciseSessionCard key={item.workoutSessionId} item={item} />
              ))}
            </div>
          </section>

          {hasMore && nextCursor && (
            <div className="mt-5 text-center">
              {error && (
                <p className="mb-2 text-xs text-destructive">{error}</p>
              )}
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={isLoading}
                onClick={() => void loadMore()}
              >
                {isLoading && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {error ? "Tentar novamente" : "Carregar mais"}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function LoadPrCard({
  loadPR,
  hasHistory,
}: {
  loadPR: GetExerciseEvolution200["loadPR"];
  hasHistory: boolean;
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-primary/25 bg-primary/8 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-primary">
        <Award className="size-5" aria-hidden="true" />
        <h2 className="font-heading text-sm font-semibold">PR de carga</h2>
      </div>
      {loadPR ? (
        <div className="mt-3">
          <p className="font-heading text-2xl font-semibold text-foreground">
            {formatWeightInGrams(loadPR.weightInGrams)}
            {loadPR.reps !== null ? ` × ${loadPR.reps}` : ""}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {loadPR.rir !== null && <span>RIR {loadPR.rir}</span>}
            <LocalDate isoDate={loadPR.completedAt} />
          </div>
          {(loadPR.workoutDayNameSnapshot ||
            loadPR.workoutPlanNameSnapshot) && (
            <p className="mt-2 text-xs text-muted-foreground">
              {loadPR.workoutDayNameSnapshot ?? "Treino planejado"}
              {loadPR.workoutPlanNameSnapshot
                ? ` · ${loadPR.workoutPlanNameSnapshot}`
                : ""}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {hasHistory
            ? "Nenhum PR de carga registrado"
            : "O PR aparecerá após uma execução com carga registrada."}
        </p>
      )}
    </section>
  );
}

function ExerciseLoadChart({
  items,
}: {
  items: GetExerciseEvolution200ItemsItem[];
}) {
  const chronologicalItems = [...items].reverse();
  const maxWeight = Math.max(
    0,
    ...chronologicalItems.map((item) => item.topSet?.weightKg ?? 0),
  );
  const labelStep = chronologicalItems.length > 8 ? 3 : 2;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Carga máxima por sessão
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Top set registrado em cada treino
      </p>
      <figure className="mt-5" aria-label="Carga máxima por sessão">
        <div
          className="grid h-40 items-end gap-1.5 border-b border-border"
          style={{
            gridTemplateColumns: `repeat(${chronologicalItems.length}, minmax(0, 1fr))`,
          }}
        >
          {chronologicalItems.map((item) => {
            const weight = item.topSet?.weightKg;
            const label = `${formatDateOnly(item.completedAt)}: ${
              weight !== null && weight !== undefined
                ? formatWeightKg(weight)
                : "sem carga registrada"
            }${item.topSet?.reps !== null && item.topSet?.reps !== undefined ? `, ${item.topSet.reps} reps` : ""}${item.topSet?.rir !== null && item.topSet?.rir !== undefined ? `, RIR ${item.topSet.rir}` : ""}.`;
            return (
              <div
                key={item.workoutSessionId}
                className="flex h-full min-w-0 items-end justify-center"
                role="img"
                aria-label={label}
                title={label}
              >
                {weight !== null && weight !== undefined ? (
                  <div
                    className="w-full max-w-9 rounded-t-md bg-primary/80"
                    style={{
                      height: `${Math.max(7, (weight / Math.max(1, maxWeight)) * 100)}%`,
                    }}
                  />
                ) : (
                  <span className="mb-1 text-[10px] text-muted-foreground">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div
          className="mt-2 grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${chronologicalItems.length}, minmax(0, 1fr))`,
          }}
          aria-hidden="true"
        >
          {chronologicalItems.map((item, index) => (
            <span
              key={item.workoutSessionId}
              className="truncate text-center text-[9px] text-muted-foreground"
            >
              {index % labelStep === 0 ||
              index === chronologicalItems.length - 1
                ? formatDateOnly(item.completedAt)
                : ""}
            </span>
          ))}
        </div>
      </figure>
    </section>
  );
}

function ExerciseSessionCard({
  item,
}: {
  item: GetExerciseEvolution200ItemsItem;
}) {
  const title = getHistorySessionTitle(item);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-sm font-semibold text-foreground">
            {title}
          </h3>
          <LocalDate
            isoDate={item.completedAt}
            className="mt-0.5 block text-[11px] text-muted-foreground"
          />
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {item.origin === "PLANNED" ? "Planejado" : "Avulso"}
        </Badge>
      </div>

      <div className="mt-3 rounded-xl bg-secondary/60 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Top set
        </p>
        <p className="mt-1 font-heading text-sm font-semibold text-foreground">
          {formatTopSet(item)}
        </p>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {item.workingSetsCount} séries · {item.totalReps} reps ·{" "}
        {item.loadVolumeKg > 0
          ? formatWeightKg(item.loadVolumeKg)
          : "Sem carga registrada"}
      </p>

      <div className="mt-3 divide-y divide-border/70 border-y border-border/70">
        {item.sets.map((set) => (
          <EvolutionSetRow key={set.id} set={set} />
        ))}
      </div>

      <Link
        href={`/history/${item.workoutSessionId}`}
        className="mt-3 inline-flex min-h-10 items-center gap-1 rounded-lg pr-2 font-heading text-xs font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Ver treino
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

function formatTopSet(item: GetExerciseEvolution200ItemsItem): string {
  if (!item.topSet) return "Sem top set registrado";
  const facts = [
    item.topSet.weightInGrams !== null
      ? formatWeightInGrams(item.topSet.weightInGrams)
      : null,
    item.topSet.reps !== null ? `${item.topSet.reps} reps` : null,
    item.topSet.rir !== null ? `RIR ${item.topSet.rir}` : null,
  ].filter(Boolean);
  return facts.length > 0 ? facts.join(" · ") : "Sem carga ou reps registradas";
}

function EvolutionSetRow({
  set,
}: {
  set: GetExerciseEvolution200ItemsItemSetsItem;
}) {
  const facts = [
    set.weightInGrams !== null ? formatWeightInGrams(set.weightInGrams) : null,
    set.reps !== null ? `${set.reps} reps` : null,
    set.rir !== null ? `RIR ${set.rir}` : null,
    set.reps === null && set.durationInSeconds !== null
      ? formatSetDuration(set.durationInSeconds)
      : null,
  ].filter(Boolean);

  return (
    <div className="py-2 text-xs">
      <p className="text-foreground">
        <span className="mr-2 text-muted-foreground">#{set.order}</span>
        {facts.length > 0 ? facts.join(" · ") : "Sem métricas registradas"}
      </p>
      {set.notes && (
        <p className="mt-1 pl-5 text-[11px] text-muted-foreground">
          {set.notes}
        </p>
      )}
    </div>
  );
}
