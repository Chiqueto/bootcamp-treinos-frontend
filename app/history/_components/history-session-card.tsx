import Link from "next/link";
import { Clock3, Dumbbell, Layers3, Scale } from "lucide-react";

import type { ListWorkoutHistory200ItemsItem } from "@/app/_lib/api/fetch-generated";
import { Badge } from "@/components/ui/badge";

import {
  formatDuration,
  formatWeightKg,
  getHistorySessionTitle,
} from "../_lib/history-formatters";
import { HistoryLocalDate } from "./history-local-date";

export function HistorySessionCard({
  session,
}: {
  session: ListWorkoutHistory200ItemsItem;
}) {
  const title = getHistorySessionTitle(session);

  return (
    <Link
      href={`/history/${session.id}`}
      className="group block rounded-2xl border border-border bg-card p-4 shadow-sm outline-none transition hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
      aria-label={`Ver detalhes de ${title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-heading text-base font-semibold text-foreground">
            {title}
          </h2>
          {session.origin === "PLANNED" &&
            session.workoutPlanNameSnapshot &&
            session.workoutPlanNameSnapshot !== title && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {session.workoutPlanNameSnapshot}
              </p>
            )}
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 font-heading text-[10px] uppercase tracking-wide"
        >
          {session.origin === "PLANNED" ? "Planejado" : "Avulso"}
        </Badge>
      </div>

      <HistoryLocalDate
        isoDate={session.completedAt}
        className="mt-2 block text-xs text-muted-foreground"
      />

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs text-muted-foreground">
        <Metric
          icon={Dumbbell}
          label={`${session.exercisesCount} exercícios`}
        />
        <Metric icon={Layers3} label={`${session.workingSetsCount} séries`} />
        <Metric
          icon={Clock3}
          label={formatDuration(session.durationInSeconds)}
        />
        <Metric
          icon={Scale}
          label={
            session.totalLoadVolumeKg > 0
              ? formatWeightKg(session.totalLoadVolumeKg)
              : "Sem carga registrada"
          }
        />
      </div>
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
}: {
  icon: typeof Dumbbell;
  label: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}
