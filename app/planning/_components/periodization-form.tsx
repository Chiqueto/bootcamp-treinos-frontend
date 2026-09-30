"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { createPeriodizationAction } from "@/app/planning/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PeriodizationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) {
      setError("Informe o nome da periodização.");
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const result = await createPeriodizationAction({
        name,
        goal: goal.trim() || null,
        notes: notes.trim() || null,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/planning/periodizations/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Nome *
        <Input
          value={name}
          maxLength={120}
          placeholder="Pré-Temporada 2027"
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Objetivo
        <Input
          value={goal}
          maxLength={300}
          placeholder="Preparação para competição"
          onChange={(event) => setGoal(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Observações
        <textarea
          value={notes}
          rows={5}
          maxLength={2000}
          placeholder="Contexto e observações gerais do ciclo"
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-32 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="button"
        className="h-12 rounded-full"
        disabled={isPending}
        onClick={submit}
      >
        {isPending && <LoaderCircle className="animate-spin" />}
        {isPending ? "Criando..." : "Criar periodização"}
      </Button>
    </div>
  );
}
