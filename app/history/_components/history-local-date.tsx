"use client";

import { useSyncExternalStore } from "react";

import { formatHistoryDate } from "../_lib/history-formatters";

export function HistoryLocalDate({
  isoDate,
  long = false,
  className,
}: {
  isoDate: string;
  long?: boolean;
  className?: string;
}) {
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const label = isClient ? formatHistoryDate(isoDate, { long }) : null;

  return (
    <time dateTime={isoDate} className={className}>
      {label ?? <span aria-hidden="true">&nbsp;</span>}
    </time>
  );
}
