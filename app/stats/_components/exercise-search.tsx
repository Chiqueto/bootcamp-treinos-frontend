"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Search } from "lucide-react";

import type { ListExercises200Item } from "@/app/_lib/api/fetch-generated";
import { getMuscleGroupLabel } from "@/app/_lib/muscle-labels";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { searchEvolutionExercises } from "../_actions";

export function ExerciseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListExercises200Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(0);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const generation = ++generationRef.current;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      const response = await searchEvolutionExercises(trimmedQuery);
      if (generation !== generationRef.current) return;

      if (response.success) {
        setResults(response.data);
      } else {
        setResults([]);
        setError(response.error);
      }
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  function handleQueryChange(value: string) {
    generationRef.current += 1;
    setQuery(value);
    setResults([]);
    setError(null);
    setIsLoading(Boolean(value.trim()));
  }

  const trimmedQuery = query.trim();

  return (
    <section
      aria-labelledby="exercise-search-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <h2
        id="exercise-search-title"
        className="font-heading text-lg font-semibold text-foreground"
      >
        Evolução por exercício
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Consulte PRs e suas últimas execuções
      </p>

      <div className="relative mt-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Buscar exercício..."
          aria-label="Buscar exercício"
          className="h-11 pl-9"
        />
        {isLoading && (
          <Loader2
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary"
            aria-label="Buscando exercícios"
          />
        )}
      </div>

      {!trimmedQuery ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Busque um exercício para ver sua evolução.
        </p>
      ) : error ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          {error}
        </p>
      ) : !isLoading && results.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhum exercício encontrado.
        </p>
      ) : (
        <div className="mt-3 space-y-2" aria-live="polite">
          {results.map((exercise) => {
            const primaryMuscles = exercise.muscles.filter(
              (muscle) => muscle.role === "PRIMARY",
            );
            return (
              <Link
                key={exercise.id}
                href={`/stats/exercises/${exercise.id}`}
                className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 outline-none transition hover:border-primary/40 hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-medium text-foreground">
                    {exercise.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {primaryMuscles.length > 0
                      ? primaryMuscles
                          .map((muscle) =>
                            getMuscleGroupLabel(muscle.muscleGroup),
                          )
                          .join(" · ")
                      : "Sem músculos principais classificados"}
                  </p>
                </div>
                {exercise.ownerUserId && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Custom
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
