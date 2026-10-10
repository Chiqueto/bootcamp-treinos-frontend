"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, History, Loader2, Search } from "lucide-react";

import type { ListExercises200Item } from "@/app/_lib/api/fetch-generated";
import { getMuscleGroupLabel } from "@/app/_lib/muscle-labels";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { loadInitialEvolutionExercises, searchEvolutionExercises } from "../_actions";

export function ExerciseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListExercises200Item[]>([]);
  const [initialExercises, setInitialExercises] = useState<ListExercises200Item[]>([]);
  const [onlyHistoryFilter, setOnlyHistoryFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(0);

  // Carrega exercícios que o usuário já praticou ao abrir a tela
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoadingInitial(true);
      const res = await loadInitialEvolutionExercises();
      if (isMounted) {
        if (res.success && res.data.length > 0) {
          setInitialExercises(res.data);
          setOnlyHistoryFilter(true);
        }
        setIsLoadingInitial(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    const generation = ++generationRef.current;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      const response = await searchEvolutionExercises(trimmedQuery, onlyHistoryFilter);
      if (generation !== generationRef.current) return;

      if (response.success) {
        setResults(response.data);
      } else {
        setResults([]);
        setError(response.error);
      }
      setIsLoading(false);
    }, 300);

    return () => {
      generationRef.current += 1;
      window.clearTimeout(timer);
    };
  }, [query, onlyHistoryFilter]);

  function handleQueryChange(value: string) {
    generationRef.current += 1;
    setQuery(value);
    setResults([]);
    setError(null);
    setIsLoading(Boolean(value.trim()));
  }

  const trimmedQuery = query.trim();
  const displayedExercises = trimmedQuery
    ? results
    : onlyHistoryFilter
      ? initialExercises
      : [];

  return (
    <section
      aria-labelledby="exercise-search-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="exercise-search-title"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Evolução por exercício
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Consulte PRs e suas últimas execuções
          </p>
        </div>

        {initialExercises.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 self-start sm:mt-0">
            <button
              type="button"
              onClick={() => setOnlyHistoryFilter(true)}
              className={`rounded-full px-2.5 py-1 font-heading text-[11px] font-semibold transition-colors ${
                onlyHistoryFilter
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Meus treinos
            </button>
            <button
              type="button"
              onClick={() => setOnlyHistoryFilter(false)}
              className={`rounded-full px-2.5 py-1 font-heading text-[11px] font-semibold transition-colors ${
                !onlyHistoryFilter
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder={
            onlyHistoryFilter
              ? "Buscar nos seus exercícios praticados..."
              : "Buscar em todo o catálogo..."
          }
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

      {!trimmedQuery && onlyHistoryFilter && initialExercises.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <History className="size-3.5 text-primary" />
          <span>Exercícios que você já realizou</span>
        </div>
      )}

      {error ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          {error}
        </p>
      ) : isLoadingInitial ? (
        <div className="mt-6 flex items-center justify-center py-4">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !isLoading && trimmedQuery && results.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhum exercício encontrado.
        </p>
      ) : !trimmedQuery && !onlyHistoryFilter ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Digite o nome de um exercício para consultar a progressão.
        </p>
      ) : displayedExercises.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Você ainda não realizou treinos com exercícios registrados. Busque qualquer exercício acima para consultar seu histórico.
        </p>
      ) : (
        <div className="mt-3 space-y-2" aria-live="polite">
          {displayedExercises.map((exercise) => {
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
