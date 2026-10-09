"use client";

import { useState } from "react";
import type { GetWeeklyTrainingAnalytics200WeeksItem } from "@/app/_lib/api/fetch-generated";
import { formatDateOnly, formatWeightKg } from "@/app/_lib/training-formatters";

export function WeeklyVolumeChart({
  weeks,
}: {
  weeks: GetWeeklyTrainingAnalytics200WeeksItem[];
}) {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);
  const maxVolume = Math.max(0, ...weeks.map((week) => week.loadVolumeKg));
  const labelStep = weeks.length > 8 ? 3 : weeks.length > 4 ? 2 : 1;

  const selectedWeek =
    selectedWeekIndex !== null ? weeks[selectedWeekIndex] : null;

  const formatBarValue = (volumeKg: number) => {
    if (volumeKg === 0) return "0";
    if (volumeKg >= 1000) {
      const ton = volumeKg / 1000;
      return ton >= 10 ? `${Math.round(ton)}t` : `${ton.toFixed(1)}t`;
    }
    return `${Math.round(volumeKg)}kg`;
  };

  return (
    <section
      aria-labelledby="weekly-volume-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="weekly-volume-title"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Volume semanal
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Carga total registrada por semana (toque em uma barra para detalhes)
          </p>
        </div>
      </div>

      <figure
        className="mt-5"
        aria-label="Gráfico de volume de carga por semana"
      >
        <div
          className="grid h-48 items-end gap-1.5 border-b border-border sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
        >
          {weeks.map((week, idx) => {
            const height =
              maxVolume === 0 ? 0 : (week.loadVolumeKg / maxVolume) * 100;
            const isSelected = selectedWeekIndex === idx;
            const accessibleLabel = `Semana de ${formatDateOnly(
              week.weekStartDate,
            )}: ${formatWeightKg(week.loadVolumeKg)}, ${week.workingSets} séries, ${week.workoutsCompleted} treinos.`;

            return (
              <button
                key={week.weekStartDate}
                type="button"
                onClick={() =>
                  setSelectedWeekIndex(selectedWeekIndex === idx ? null : idx)
                }
                className="group flex h-full min-w-0 flex-col items-center justify-end focus:outline-none"
                aria-label={accessibleLabel}
                title={accessibleLabel}
              >
                {/* Legenda com o valor em cima de cada barra */}
                <span
                  className={`mb-1 truncate text-[10px] font-bold tracking-tight transition-all select-none ${
                    isSelected
                      ? "text-primary scale-110"
                      : "text-muted-foreground/80 group-hover:text-foreground"
                  }`}
                >
                  {formatBarValue(week.loadVolumeKg)}
                </span>

                {/* Barra do gráfico */}
                <div
                  className={`w-full max-w-10 rounded-t-md transition-all ${
                    isSelected
                      ? "bg-primary shadow-md shadow-primary/25 ring-2 ring-primary ring-offset-1 ring-offset-card"
                      : week.loadVolumeKg === 0
                        ? "bg-muted/40"
                        : "bg-primary/75 group-hover:bg-primary"
                  }`}
                  style={{
                    height:
                      week.loadVolumeKg === 0
                        ? "3px"
                        : `${Math.max(8, height)}%`,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Eixo de Datas */}
        <div
          className="mt-2 grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
          aria-hidden="true"
        >
          {weeks.map((week, index) => {
            const isSelected = selectedWeekIndex === index;
            return (
              <span
                key={week.weekStartDate}
                className={`truncate text-center text-[9px] transition-colors sm:text-[10px] ${
                  isSelected
                    ? "font-bold text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {index % labelStep === 0 || index === weeks.length - 1
                  ? formatDateOnly(week.weekStartDate)
                  : ""}
              </span>
            );
          })}
        </div>

        {/* Detalhe interativo da barra selecionada */}
        {selectedWeek && (
          <div className="mt-4 flex flex-col gap-1 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs animate-in fade-in slide-in-from-bottom-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-foreground">
                Semana de {formatDateOnly(selectedWeek.weekStartDate)}
              </span>
              <span className="text-primary font-bold">
                {formatWeightKg(selectedWeek.loadVolumeKg)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>{selectedWeek.workingSets} séries válidas</span>
              <span>•</span>
              <span>{selectedWeek.workoutsCompleted} treinos realizados</span>
            </div>
          </div>
        )}

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
