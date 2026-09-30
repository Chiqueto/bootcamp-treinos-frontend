"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Dumbbell,
  LoaderCircle,
  Pencil,
  PlayCircle,
  Save,
  Trash2,
  X,
} from "lucide-react";

import type { GetPeriodization200PlansItem } from "@/app/_lib/api/fetch-generated";
import {
  removeWorkoutPlanFromPeriodizationAction,
  reorderPeriodizationPlansAction,
  updatePeriodizationPlanAction,
} from "@/app/planning/_actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanningConfirmDialog } from "./planning-confirm-dialog";

type PeriodizationStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";

interface PeriodizationStructureEditorProps {
  periodizationId: string;
  status: PeriodizationStatus;
  initialPlans: GetPeriodization200PlansItem[];
}

function isPlanned(plan: GetPeriodization200PlansItem) {
  return plan.activatedAt === null && plan.completedAt === null;
}

function formatDate(date: string | null): string | null {
  if (!date) return null;
  const [year, month, day] = date.split("T")[0].split("-");
  return year && month && day ? `${day}/${month}` : date;
}

export function PeriodizationStructureEditor({
  periodizationId,
  status,
  initialPlans,
}: PeriodizationStructureEditorProps) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [orderChanged, setOrderChanged] = useState(false);
  const [editing, setEditing] = useState<GetPeriodization200PlansItem>();
  const [removing, setRemoving] = useState<GetPeriodization200PlansItem>();
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | undefined
  >();
  const [isPending, startTransition] = useTransition();

  const sortedPlans = [...plans].sort((a, b) => a.order - b.order);
  const editablePlans = sortedPlans.filter(isPlanned);

  function movePlan(planId: string, offset: -1 | 1) {
    const currentEditableIndex = editablePlans.findIndex(
      (plan) => plan.id === planId,
    );
    const targetEditableIndex = currentEditableIndex + offset;
    if (targetEditableIndex < 0 || targetEditableIndex >= editablePlans.length)
      return;

    const currentPosition = sortedPlans.findIndex((plan) => plan.id === planId);
    const targetPosition = sortedPlans.findIndex(
      (plan) => plan.id === editablePlans[targetEditableIndex].id,
    );
    const reordered = [...sortedPlans];
    [reordered[currentPosition], reordered[targetPosition]] = [
      reordered[targetPosition],
      reordered[currentPosition],
    ];
    setPlans(reordered.map((plan, index) => ({ ...plan, order: index + 1 })));
    setOrderChanged(true);
    setFeedback(undefined);
  }

  function saveOrder() {
    const plannedIds = sortedPlans.filter(isPlanned).map((plan) => plan.id);
    if (!orderChanged || plannedIds.length === 0) return;

    startTransition(async () => {
      const result = await reorderPeriodizationPlansAction(periodizationId, {
        periodizationPlanIds: plannedIds,
      });
      if (!result.success) {
        setFeedback({ kind: "error", message: result.error });
        return;
      }
      setOrderChanged(false);
      setFeedback({ kind: "success", message: "Ordem das etapas atualizada." });
      router.refresh();
    });
  }

  function openEdit(plan: GetPeriodization200PlansItem) {
    setEditing(plan);
    setPlannedStartDate(plan.plannedStartDate?.split("T")[0] ?? "");
    setPlannedEndDate(plan.plannedEndDate?.split("T")[0] ?? "");
    setNotes(plan.notes ?? "");
    setFeedback(undefined);
  }

  function saveBlock() {
    if (!editing) return;
    if (
      plannedStartDate &&
      plannedEndDate &&
      plannedEndDate < plannedStartDate
    ) {
      setFeedback({
        kind: "error",
        message: "A data final não pode ser anterior à data inicial.",
      });
      return;
    }

    startTransition(async () => {
      const result = await updatePeriodizationPlanAction(
        periodizationId,
        editing.id,
        {
          plannedStartDate: plannedStartDate || null,
          plannedEndDate: plannedEndDate || null,
          notes: notes.trim() || null,
        },
      );
      if (!result.success) {
        setFeedback({ kind: "error", message: result.error });
        return;
      }
      setPlans((current) =>
        current.map((plan) =>
          plan.id === editing.id
            ? {
                ...plan,
                plannedStartDate: result.data.plannedStartDate,
                plannedEndDate: result.data.plannedEndDate,
                notes: result.data.notes,
              }
            : plan,
        ),
      );
      setEditing(undefined);
      setFeedback({
        kind: "success",
        message: "Etapa atualizada com sucesso.",
      });
      router.refresh();
    });
  }

  function removeBlock() {
    if (!removing) return;
    const removingId = removing.id;
    startTransition(async () => {
      const result = await removeWorkoutPlanFromPeriodizationAction(
        periodizationId,
        removingId,
      );
      if (!result.success) {
        setRemoving(undefined);
        setFeedback({ kind: "error", message: result.error });
        return;
      }
      setPlans((current) =>
        current
          .filter((plan) => plan.id !== removingId)
          .sort((a, b) => a.order - b.order)
          .map((plan, index) => ({ ...plan, order: index + 1 })),
      );
      setRemoving(undefined);
      setOrderChanged(false);
      setFeedback({
        kind: "success",
        message: "Etapa removida da periodização.",
      });
      router.refresh();
    });
  }

  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby="section-blocks-timeline"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="section-blocks-timeline"
          className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Sequência de blocos ({sortedPlans.length})
        </h2>
        {orderChanged && (
          <Button
            size="sm"
            className="h-11 rounded-full"
            disabled={isPending}
            onClick={saveOrder}
          >
            {isPending ? <LoaderCircle className="animate-spin" /> : <Save />}
            {isPending ? "Salvando..." : "Salvar ordem"}
          </Button>
        )}
      </div>

      {feedback && !editing && !removing && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`flex items-center gap-2 rounded-xl p-3 text-sm ${feedback.kind === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
        >
          {feedback.kind === "success" && <CheckCircle2 className="size-4" />}
          {feedback.message}
        </p>
      )}

      {sortedPlans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center text-sm text-muted-foreground">
          Nenhuma etapa cadastrada nesta periodização.
        </div>
      ) : (
        <div className="relative flex flex-col gap-3 pl-3">
          <div
            className="absolute bottom-5 left-6.5 top-5 w-0.5 bg-border/80"
            aria-hidden="true"
          />
          {sortedPlans.map((plan) => {
            const completed = plan.completedAt !== null;
            const active =
              plan.activatedAt !== null && plan.completedAt === null;
            const planned = isPlanned(plan);
            const editableIndex = editablePlans.findIndex(
              (item) => item.id === plan.id,
            );
            const start = formatDate(plan.plannedStartDate);
            const end = formatDate(plan.plannedEndDate);

            return (
              <article
                key={plan.id}
                className="relative flex items-start gap-3"
              >
                <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-background">
                  {completed && (
                    <CheckCircle2 className="size-6 text-primary" />
                  )}
                  {active && <PlayCircle className="size-6 text-primary" />}
                  {planned && (
                    <Circle className="size-5 text-muted-foreground/60" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {plan.order}.
                        </span>
                        <h3 className="truncate font-heading text-sm font-semibold">
                          {plan.workoutPlan.name}
                        </h3>
                      </div>
                      {(start || end) && (
                        <p className="mt-1 flex items-center gap-1.5 pl-4 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {start ?? "Início"} → {end ?? "Fim"}
                        </p>
                      )}
                      {plan.notes && (
                        <p className="mt-1 line-clamp-2 pl-4 text-xs text-muted-foreground">
                          {plan.notes}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        active ? "default" : completed ? "outline" : "secondary"
                      }
                      className="shrink-0 rounded-full px-2 py-0 text-[10px]"
                    >
                      {active
                        ? "Em andamento"
                        : completed
                          ? "Concluído"
                          : "Planejado"}
                    </Badge>
                  </div>

                  {status !== "COMPLETED" && (active || planned) && (
                    <div className="flex flex-wrap items-center gap-1 border-t border-border/50 pt-2">
                      <button
                        type="button"
                        onClick={() => openEdit(plan)}
                        disabled={isPending}
                        className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold hover:bg-accent"
                      >
                        <Pencil className="size-3.5" />
                        Editar etapa
                      </button>
                      {planned && (
                        <>
                          <button
                            type="button"
                            aria-label={`Mover ${plan.workoutPlan.name} para cima`}
                            disabled={editableIndex === 0 || isPending}
                            onClick={() => movePlan(plan.id, -1)}
                            className="flex size-11 items-center justify-center rounded-full hover:bg-accent disabled:opacity-30"
                          >
                            <ArrowUp className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Mover ${plan.workoutPlan.name} para baixo`}
                            disabled={
                              editableIndex === editablePlans.length - 1 ||
                              isPending
                            }
                            onClick={() => movePlan(plan.id, 1)}
                            className="flex size-11 items-center justify-center rounded-full hover:bg-accent disabled:opacity-30"
                          >
                            <ArrowDown className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remover ${plan.workoutPlan.name} da periodização`}
                            disabled={isPending}
                            onClick={() => setRemoving(plan)}
                            className="flex size-11 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/workout-plans/${plan.workoutPlan.id}`}
                    className="flex min-h-11 items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex items-center gap-1.5">
                      <Dumbbell className="size-3" />
                      Ver treinos do bloco
                    </span>
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-block-title"
            className="flex max-h-[90svh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl bg-card p-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2
                  id="edit-block-title"
                  className="font-heading text-base font-semibold"
                >
                  Editar etapa
                </h2>
                <p className="text-xs text-muted-foreground">
                  {editing.workoutPlan.name}
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                disabled={isPending}
                onClick={() => setEditing(undefined)}
                className="flex size-11 items-center justify-center rounded-full hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Início previsto
                <Input
                  type="date"
                  value={plannedStartDate}
                  onChange={(event) => setPlannedStartDate(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Fim previsto
                <Input
                  type="date"
                  value={plannedEndDate}
                  onChange={(event) => setPlannedEndDate(event.target.value)}
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Notas
              <textarea
                value={notes}
                rows={4}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-28 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {feedback?.kind === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {feedback.message}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11 rounded-full"
                disabled={isPending}
                onClick={() => setEditing(undefined)}
              >
                Cancelar
              </Button>
              <Button
                className="h-11 rounded-full"
                disabled={isPending}
                onClick={saveBlock}
              >
                {isPending && <LoaderCircle className="animate-spin" />}
                {isPending ? "Salvando..." : "Salvar etapa"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PlanningConfirmDialog
        open={Boolean(removing)}
        title={
          removing
            ? `Remover "${removing.workoutPlan.name}" desta periodização?`
            : "Remover etapa?"
        }
        description={
          <>
            <p>O plano não será excluído e continuará disponível</p>
            <p>em Meus Planos.</p>
          </>
        }
        confirmLabel="Remover etapa"
        pendingLabel="Removendo..."
        destructive
        isPending={isPending}
        onCancel={() => setRemoving(undefined)}
        onConfirm={removeBlock}
      />
    </section>
  );
}
