import { Clock3, Dumbbell, Layers3, Scale } from "lucide-react";

import type { GetWeeklyTrainingAnalytics200WeeksItem } from "@/app/_lib/api/fetch-generated";
import { formatDuration, formatWeightKg } from "@/app/_lib/training-formatters";

import { summarizeWeeks } from "../_lib/evolution-data";

export function PeriodSummary({
  weeks,
  weeksCount,
}: {
  weeks: GetWeeklyTrainingAnalytics200WeeksItem[];
  weeksCount: number;
}) {
  const summary = summarizeWeeks(weeks);
  const cards = [
    {
      icon: Dumbbell,
      value: String(summary.totalWorkouts),
      label: "Treinos",
    },
    {
      icon: Layers3,
      value: String(summary.totalWorkingSets),
      label: "Séries válidas",
    },
    {
      icon: Scale,
      value: formatWeightKg(summary.totalLoadVolumeKg),
      label: "Volume",
    },
    {
      icon: Clock3,
      value: formatDuration(summary.totalDurationInSeconds),
      label: "Tempo",
    },
  ];

  return (
    <section aria-labelledby="period-summary-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Resumo</p>
          <h2
            id="period-summary-title"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Últimas {weeksCount} semanas
          </h2>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <Icon className="size-4 text-primary" aria-hidden="true" />
            <p className="mt-2 truncate font-heading text-xl font-semibold text-foreground">
              {value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
