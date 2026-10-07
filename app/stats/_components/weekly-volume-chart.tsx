import type { GetWeeklyTrainingAnalytics200WeeksItem } from "@/app/_lib/api/fetch-generated";
import { formatDateOnly, formatWeightKg } from "@/app/_lib/training-formatters";

export function WeeklyVolumeChart({
  weeks,
}: {
  weeks: GetWeeklyTrainingAnalytics200WeeksItem[];
}) {
  const maxVolume = Math.max(0, ...weeks.map((week) => week.loadVolumeKg));
  const labelStep = weeks.length > 8 ? 3 : weeks.length > 4 ? 2 : 1;

  return (
    <section
      aria-labelledby="weekly-volume-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <h2
        id="weekly-volume-title"
        className="font-heading text-lg font-semibold text-foreground"
      >
        Volume semanal
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Carga total registrada por semana
      </p>

      <figure
        className="mt-5"
        aria-label="Gráfico de volume de carga por semana"
      >
        <div
          className="grid h-44 items-end gap-1.5 border-b border-border sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
        >
          {weeks.map((week) => {
            const height =
              maxVolume === 0 ? 0 : (week.loadVolumeKg / maxVolume) * 100;
            const accessibleLabel = `Semana de ${formatDateOnly(
              week.weekStartDate,
            )}: ${formatWeightKg(week.loadVolumeKg)}, ${week.workingSets} séries, ${week.workoutsCompleted} treinos.`;

            return (
              <div
                key={week.weekStartDate}
                className="group flex h-full min-w-0 items-end justify-center"
                aria-label={accessibleLabel}
                role="img"
                title={accessibleLabel}
              >
                <div
                  className="w-full max-w-10 rounded-t-md bg-primary/80 transition group-hover:bg-primary"
                  style={{
                    height:
                      week.loadVolumeKg === 0
                        ? "2px"
                        : `${Math.max(6, height)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          className="mt-2 grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
          aria-hidden="true"
        >
          {weeks.map((week, index) => (
            <span
              key={week.weekStartDate}
              className="truncate text-center text-[9px] text-muted-foreground sm:text-[10px]"
            >
              {index % labelStep === 0 || index === weeks.length - 1
                ? formatDateOnly(week.weekStartDate)
                : ""}
            </span>
          ))}
        </div>
        <ul className="sr-only">
          {weeks.map((week) => (
            <li key={week.weekStartDate}>
              Semana de {formatDateOnly(week.weekStartDate)}:{" "}
              {week.loadVolumeKg}
              kg, {week.workingSets} séries, {week.workoutsCompleted} treinos.
            </li>
          ))}
        </ul>
      </figure>
    </section>
  );
}
