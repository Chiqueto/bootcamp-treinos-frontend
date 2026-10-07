"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  loadEvolutionDashboard,
  type EvolutionDashboardData,
  type EvolutionRange,
} from "../_actions";
import { summarizeWeeks } from "../_lib/evolution-data";
import { ExerciseSearch } from "./exercise-search";
import { MuscleDistribution } from "./muscle-distribution";
import { PeriodSummary } from "./period-summary";
import { WeeklyVolumeChart } from "./weekly-volume-chart";

const RANGES: EvolutionRange[] = [4, 8, 12];

function useBrowserTimeZone(): string | null {
  return useSyncExternalStore(
    () => () => undefined,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    () => null,
  );
}

export function EvolutionDashboard() {
  const timezone = useBrowserTimeZone();
  const [range, setRange] = useState<EvolutionRange>(4);
  const [dataRange, setDataRange] = useState<EvolutionRange | null>(null);
  const [data, setData] = useState<EvolutionDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestGenerationRef = useRef(0);

  const requestDashboard = useCallback(
    async (nextRange: EvolutionRange, currentTimezone: string) => {
      const generation = ++requestGenerationRef.current;
      setIsLoading(true);
      setError(null);

      const response = await loadEvolutionDashboard({
        timezone: currentTimezone,
        weeksCount: nextRange,
      });
      if (generation !== requestGenerationRef.current) return;

      if (response.success) {
        setData(response.data);
        setDataRange(nextRange);
      } else {
        setError(response.error);
      }
      setIsLoading(false);
    },
    [],
  );

  useEffect(() => {
    if (timezone === null) return;
    const timer = window.setTimeout(() => {
      void requestDashboard(4, timezone);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requestDashboard, timezone]);

  function selectRange(nextRange: EvolutionRange) {
    if (nextRange === range || timezone === null) return;
    setRange(nextRange);
    void requestDashboard(nextRange, timezone);
  }

  const summary = data ? summarizeWeeks(data.weekly.weeks) : null;
  const hasTrainingData = Boolean(
    summary &&
    (summary.totalWorkouts > 0 ||
      summary.totalWorkingSets > 0 ||
      summary.totalLoadVolumeKg > 0 ||
      summary.totalDurationInSeconds > 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div
          className="grid flex-1 grid-cols-3 rounded-xl bg-secondary p-1"
          aria-label="Período da evolução"
        >
          {RANGES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={range === value}
              onClick={() => selectRange(value)}
              className={cn(
                "min-h-10 rounded-lg px-1 font-heading text-[11px] outline-none transition focus-visible:ring-2 focus-visible:ring-ring sm:text-xs",
                range === value
                  ? "bg-background font-semibold text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value} semanas
            </button>
          ))}
        </div>
        {isLoading && data && (
          <Loader2
            className="size-4 shrink-0 animate-spin text-primary"
            aria-label="Atualizando evolução"
          />
        )}
      </div>

      {!data && (timezone === null || isLoading) ? (
        <EvolutionSkeleton />
      ) : !data && error ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <AlertCircle
            className="mx-auto size-8 text-destructive"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-foreground">{error}</p>
          <Button
            className="mt-4 rounded-full"
            onClick={() =>
              timezone !== null && void requestDashboard(range, timezone)
            }
          >
            Tentar novamente
          </Button>
        </div>
      ) : data ? (
        <>
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error}{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() =>
                  timezone !== null && void requestDashboard(range, timezone)
                }
              >
                Tentar novamente
              </button>
            </div>
          )}
          <PeriodSummary
            weeks={data.weekly.weeks}
            weeksCount={dataRange ?? range}
          />
          {hasTrainingData ? (
            <>
              <WeeklyVolumeChart weeks={data.weekly.weeks} />
              <MuscleDistribution analytics={data.muscles} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
              <p className="font-heading text-base font-semibold text-foreground">
                Ainda não há treinos concluídos suficientes para exibir sua
                evolução.
              </p>
              <Button asChild variant="outline" className="mt-4 rounded-full">
                <Link href="/history">Ver histórico</Link>
              </Button>
            </div>
          )}
        </>
      ) : null}

      <ExerciseSearch />

      <Link
        href="/history"
        className="flex min-h-12 items-center justify-between rounded-2xl border border-border bg-card px-4 font-heading text-sm font-medium text-foreground outline-none transition hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
      >
        Histórico de treinos
        <ArrowRight className="size-4 text-primary" aria-hidden="true" />
      </Link>
    </div>
  );
}

function EvolutionSkeleton() {
  return (
    <div className="space-y-4" aria-label="Carregando evolução">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      <div className="h-56 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
