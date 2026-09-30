"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, Dumbbell, Loader2, Plus, Search, X } from "lucide-react";
import type { ListExercises200Item } from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createExerciseAction, listExercisesAction } from "../_actions";

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseId: string) => Promise<void>;
}

export function ExerciseSelectorModal({
  isOpen,
  onClose,
  onSelectExercise,
}: ExerciseSelectorModalProps) {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<ListExercises200Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, startSubmittingTransition] = useTransition();

  // Carrega exercícios ao abrir e ao alterar o termo de busca
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await listExercisesAction(query.trim() || undefined);
      if (isMounted) {
        setIsLoading(false);
        if (res.success) {
          setExercises(res.data);
        } else {
          setErrorMessage(res.error);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, query]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim();
  const hasExactMatch = exercises.some(
    (ex) => ex.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  const handleClose = () => {
    setQuery("");
    setErrorMessage(null);
    onClose();
  };

  const handleSelect = (exerciseId: string) => {
    if (isSubmitting) return;
    setErrorMessage(null);
    startSubmittingTransition(async () => {
      try {
        await onSelectExercise(exerciseId);
        handleClose();
      } catch (err: unknown) {
        setErrorMessage(
          (err as Error)?.message || "Erro ao adicionar exercício",
        );
      }
    });
  };

  const handleCreateCustom = () => {
    if (isSubmitting || !trimmedQuery) return;
    setErrorMessage(null);
    startSubmittingTransition(async () => {
      const createRes = await createExerciseAction(trimmedQuery);
      if (!createRes.success) {
        setErrorMessage(createRes.error);
        return;
      }

      try {
        await onSelectExercise(createRes.data.id);
        handleClose();
      } catch (err: unknown) {
        setErrorMessage(
          (err as Error)?.message || "Erro ao adicionar exercício criado",
        );
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-selector-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-5 text-primary" />
            <h2
              id="exercise-selector-title"
              className="font-heading text-lg font-bold text-foreground"
            >
              Adicionar Exercício
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar exercício..."
            disabled={isSubmitting}
            className="h-11 pl-9 pr-8 rounded-xl font-heading text-sm"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span className="sr-only">Limpar busca</span>
            </button>
          )}
        </div>

        {/* Mensagem de Erro Inline */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive font-heading text-xs font-semibold"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Opção de Criar Exercício Personalizado */}
        {trimmedQuery.length > 0 && !hasExactMatch && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCreateCustom}
            disabled={isSubmitting}
            className="w-full justify-start rounded-xl border-dashed border-primary/40 bg-primary/5 py-5 font-heading text-sm font-semibold text-primary hover:bg-primary/10"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Criando...
              </span>
            ) : (
              <span className="flex items-center gap-2 truncate">
                <Plus className="size-4 shrink-0" />
                Criar &quot;{trimmedQuery}&quot;
              </span>
            )}
          </Button>
        )}

        {/* Lista de Exercícios */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40 pr-1 max-h-60 sm:max-h-72">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="font-heading text-sm font-semibold text-foreground">
                Nenhum exercício encontrado
              </p>
              {trimmedQuery.length > 0 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Você pode criá-lo como exercício personalizado acima.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Digite para buscar ou criar um novo exercício.
                </p>
              )}
            </div>
          ) : (
            exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => handleSelect(exercise.id)}
                disabled={isSubmitting}
                className="w-full text-left py-3 px-2 flex items-center justify-between hover:bg-muted/50 rounded-xl transition-colors group"
              >
                <div className="flex flex-col">
                  <span className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {exercise.name}
                  </span>
                  {exercise.ownerUserId && (
                    <span className="text-[10px] text-muted-foreground font-heading">
                      Personalizado
                    </span>
                  )}
                </div>
                <Plus className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
