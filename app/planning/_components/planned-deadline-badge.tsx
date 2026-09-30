"use client";

import { Clock } from "lucide-react";

interface PlannedDeadlineBadgeProps {
  plannedEndDate: string | null;
}

export function PlannedDeadlineBadge({
  plannedEndDate,
}: PlannedDeadlineBadgeProps) {
  if (!plannedEndDate) return null;

  // Formata YYYY-MM-DD para DD/MM de forma determinística
  const [, month, day] = plannedEndDate.split("-");
  const formattedDate = `${day}/${month}`;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="size-3.5 shrink-0" />
      <span>Previsto até {formattedDate}</span>
    </div>
  );
}
