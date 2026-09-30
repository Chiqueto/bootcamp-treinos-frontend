import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Dumbbell,
  PlayCircle,
} from "lucide-react";

import { authClient } from "@/app/_lib/auth-client";
import { getPeriodization } from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/app/_components/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { PeriodizationActions } from "../../_components/periodization-actions";

interface PeriodizationDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

export const dynamic = "force-dynamic";

export default async function PeriodizationDetailPage({
  params,
}: PeriodizationDetailPageProps) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const { id } = await params;
  const response = await getPeriodization(id).catch((err) => {
    console.error("Failed to fetch periodization:", err);
    return null;
  });

  if (!response || response.status !== 200 || !response.data) {
    redirect("/planning");
  }

  const periodization = response.data;
  const sortedPlans = [...periodization.plans].sort(
    (a, b) => a.order - b.order,
  );
  const totalBlocks = sortedPlans.length;
  const completedBlocks = sortedPlans.filter(
    (p) => p.completedAt !== null,
  ).length;
  const currentBlockIndex = sortedPlans.findIndex(
    (plan) => plan.activatedAt !== null && plan.completedAt === null,
  );
  const currentBlock =
    currentBlockIndex >= 0 ? sortedPlans[currentBlockIndex] : undefined;
  const nextBlock =
    currentBlockIndex >= 0 ? sortedPlans[currentBlockIndex + 1] : undefined;

  let statusLabel = "RASCUNHO";
  let statusVariant: "default" | "secondary" | "outline" = "secondary";

  if (periodization.status === "ACTIVE") {
    statusLabel = "ATIVA";
    statusVariant = "default";
  } else if (periodization.status === "PAUSED") {
    statusLabel = "PAUSADA";
    statusVariant = "secondary";
  } else if (periodization.status === "COMPLETED") {
    statusLabel = "CONCLUÍDA";
    statusVariant = "outline";
  }

  return (
    <div className="flex min-h-svh flex-col bg-background pb-28">
      {/* Top bar with back button */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur-md">
        <Link
          href="/planning"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span>Voltar ao Planejamento</span>
        </Link>
        <p
          className="text-[18px] uppercase leading-none text-foreground"
          style={{ fontFamily: "var(--font-anton)" }}
        >
          Trainvy
        </p>
      </header>

      <main className="flex flex-col gap-6 p-5">
        {/* Info do Ciclo */}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
                {periodization.name}
              </h1>
              {periodization.goal && (
                <p className="text-xs text-muted-foreground">
                  {periodization.goal}
                </p>
              )}
            </div>
            <Badge
              variant={statusVariant}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0"
            >
              {statusLabel}
            </Badge>
          </div>

          {periodization.notes && (
            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              {periodization.notes}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-heading font-semibold text-foreground">
                {completedBlocks} de {totalBlocks} concluídos
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Status do Ciclo</span>
              <span className="font-heading font-semibold text-foreground">
                {statusLabel}
              </span>
            </div>
          </div>
        </section>

        <PeriodizationActions
          id={periodization.id}
          status={periodization.status}
          totalBlocks={totalBlocks}
          currentBlockName={currentBlock?.workoutPlan.name}
          nextBlockName={nextBlock?.workoutPlan.name}
          isLastBlock={
            currentBlockIndex >= 0 && currentBlockIndex === totalBlocks - 1
          }
        />

        {/* Timeline dos Blocos */}
        <section
          className="flex flex-col gap-3"
          aria-labelledby="section-blocks-timeline"
        >
          <div className="flex items-center justify-between">
            <h2
              id="section-blocks-timeline"
              className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Sequência de Blocos ({totalBlocks})
            </h2>
          </div>

          {sortedPlans.length === 0 ? (
            <div className="flex flex-col gap-1 rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center">
              <p className="font-heading text-sm font-medium text-foreground">
                Nenhum bloco cadastrado nesta periodização.
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col gap-3 pl-3">
              {/* Linha vertical contínua da timeline */}
              <div
                className="absolute left-6.5 top-5 bottom-5 w-0.5 bg-border/80"
                aria-hidden="true"
              />

              {sortedPlans.map((planItem) => {
                const isCompleted = planItem.completedAt !== null;
                const isActive =
                  planItem.activatedAt !== null &&
                  planItem.completedAt === null;
                const isPlanned =
                  planItem.activatedAt === null &&
                  planItem.completedAt === null;

                const startFormatted = formatDate(planItem.plannedStartDate);
                const endFormatted = formatDate(planItem.plannedEndDate);
                const hasDates = startFormatted || endFormatted;

                return (
                  <div
                    key={planItem.id}
                    className="relative flex items-start gap-4"
                  >
                    {/* Indicador / Marcador da Timeline */}
                    <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-background">
                      {isCompleted && (
                        <CheckCircle2 className="size-6 text-primary fill-primary/10" />
                      )}
                      {isActive && (
                        <span className="relative flex size-6 items-center justify-center">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                          <PlayCircle className="relative size-6 text-primary fill-primary/10" />
                        </span>
                      )}
                      {isPlanned && (
                        <Circle className="size-5 text-muted-foreground/60 stroke-[1.5]" />
                      )}
                    </div>

                    {/* Card clicável do Bloco */}
                    <Link
                      href={`/workout-plans/${planItem.workoutPlan.id}`}
                      className="group flex-1 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-xs font-bold text-muted-foreground">
                              {planItem.order}.
                            </span>
                            <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {planItem.workoutPlan.name}
                            </h3>
                          </div>

                          {hasDates && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-4">
                              <Calendar className="size-3 shrink-0" />
                              <span>
                                {startFormatted ?? "Início"} →{" "}
                                {endFormatted ?? "Fim"}
                              </span>
                            </div>
                          )}

                          {planItem.notes && (
                            <p className="text-xs text-muted-foreground pl-4 line-clamp-2">
                              {planItem.notes}
                            </p>
                          )}
                        </div>

                        <Badge
                          variant={
                            isActive
                              ? "default"
                              : isCompleted
                                ? "outline"
                                : "secondary"
                          }
                          className="rounded-full px-2 py-0 text-[10px] font-semibold shrink-0"
                        >
                          {isActive
                            ? "Em andamento"
                            : isCompleted
                              ? "Concluído"
                              : "Planejado"}
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="size-3 text-muted-foreground" />
                          <span>Ver treinos do bloco</span>
                        </span>
                        <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav activePage="planning" />
    </div>
  );
}
