"use client";

import { useState } from "react";

import type { GetMuscleTrainingAnalytics200 } from "@/app/_lib/api/fetch-generated";
import { getMuscleGroupLabel } from "@/app/_lib/muscle-labels";
import { Button } from "@/components/ui/button";

export function MuscleDistribution({
  analytics,
}: {
  analytics: GetMuscleTrainingAnalytics200;
}) {
  const [showAll, setShowAll] = useState(false);
  const activeMuscles = analytics.muscles.filter(
    (muscle) => muscle.directWorkingSets > 0 || muscle.indirectWorkingSets > 0,
  );
  const visibleMuscles = showAll ? analytics.muscles : activeMuscles;
  const maxSets = Math.max(
    1,
    ...analytics.muscles.flatMap((muscle) => [
      muscle.directWorkingSets,
      muscle.indirectWorkingSets,
    ]),
  );

  return (
    <section
      aria-labelledby="muscle-distribution-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="muscle-distribution-title"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Distribuição muscular
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Séries diretas e indiretas, sem ponderação
          </p>
        </div>
        {activeMuscles.length < analytics.muscles.length && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? "Mostrar ativos" : "Mostrar todos"}
          </Button>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {visibleMuscles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma série possui classificação muscular neste período.
          </p>
        ) : (
          visibleMuscles.map((muscle) => (
            <div key={muscle.muscleGroup}>
              <p className="font-heading text-sm font-medium text-foreground">
                {getMuscleGroupLabel(muscle.muscleGroup)}
              </p>
              <MuscleBar
                label="Diretas"
                value={muscle.directWorkingSets}
                max={maxSets}
                className="bg-primary"
              />
              <MuscleBar
                label="Indiretas"
                value={muscle.indirectWorkingSets}
                max={maxSets}
                className="bg-primary/35"
              />
            </div>
          ))
        )}
      </div>

      <div className="mt-5 rounded-xl bg-secondary/70 p-3 text-xs text-muted-foreground">
        <p>
          <strong className="font-semibold text-foreground">
            {analytics.totalWorkingSets} séries
          </strong>{" "}
          no período · {analytics.classifiedWorkingSets} classificadas ·{" "}
          {analytics.unclassifiedWorkingSets} não classificadas
        </p>
        {analytics.unclassifiedWorkingSets > 0 && (
          <p className="mt-1.5">
            {analytics.unclassifiedWorkingSets} séries ainda não possuem
            classificação muscular.
          </p>
        )}
      </div>
    </section>
  );
}

function MuscleBar({
  label,
  value,
  max,
  className,
}: {
  label: string;
  value: number;
  max: number;
  className: string;
}) {
  return (
    <div className="mt-2 grid grid-cols-[4.5rem_1fr_1.5rem] items-center gap-2 text-[11px] text-muted-foreground">
      <span>{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${className}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
