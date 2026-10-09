import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Dumbbell,
  CalendarRange,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

import { authClient } from "@/app/_lib/auth-client";
import {
  getPlanningOverview,
  GetPlanningOverview200PeriodizationsItem,
  getUserTrainData,
} from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/app/_components/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { PlanningCreateMenu } from "./_components/planning-create-menu";
import { PlannedDeadlineBadge } from "./_components/planned-deadline-badge";
import { WorkoutPlanCard } from "./_components/workout-plan-card";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const [overviewResponse, trainData] = await Promise.all([
    getPlanningOverview().catch((err) => {
      console.error("Failed to fetch planning overview:", err);
      return null;
    }),
    getUserTrainData(),
  ]);

  const needsOnboarding =
    (trainData.status === 200 && !trainData.data) || trainData.status === 404;
  if (needsOnboarding) redirect("/onboarding");

  // Tratamento amigável para erro de visão geral ou INCONSISTENT_PLANNING_STATE
  if (
    !overviewResponse ||
    overviewResponse.status !== 200 ||
    !overviewResponse.data
  ) {
    return (
      <div className="flex min-h-svh flex-col bg-background pb-24">
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-5">
          <p
            className="text-[20px] uppercase leading-none text-foreground"
            style={{ fontFamily: "var(--font-anton)" }}
          >
            Trainvy
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <AlertCircle className="size-7" />
          </div>
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Não foi possível carregar seu planejamento.
          </h1>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Ocorreu uma instabilidade ao recuperar suas periodizações e planos.
            Tente novamente em instantes.
          </p>
          <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
            <Link
              href="/planning"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-heading text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <RotateCcw className="size-3.5" />
              <span>Tentar novamente</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 font-heading text-xs font-medium text-muted-foreground transition hover:bg-accent"
            >
              <span>Voltar ao início</span>
            </Link>
          </div>
        </div>

        <BottomNav activePage="planning" />
      </div>
    );
  }

  const { activeContext, plans, periodizations } = overviewResponse.data;

  return (
    <div className="flex min-h-svh flex-col bg-background pb-28">
      {/* Header Mobile-First */}
      <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <p
            className="text-[20px] uppercase leading-none text-foreground"
            style={{ fontFamily: "var(--font-anton)" }}
          >
            Trainvy
          </p>
          <PlanningCreateMenu />
        </div>

        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
            Rotinas de Treino
          </h1>
          <p className="font-heading text-xs text-muted-foreground">
            Gerencie seus planos, divisões e ciclos de treino
          </p>
        </div>
      </header>

      <main className="flex flex-col gap-6 p-5">
        {/* Seção 1: Plano em Execução */}
        <section
          className="flex flex-col gap-3"
          aria-labelledby="section-active-now"
        >
          <div className="flex items-center justify-between">
            <h2
              id="section-active-now"
              className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Plano em Execução
            </h2>
          </div>

          {activeContext.type === "NONE" && (
            <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
              <p className="font-heading text-sm font-semibold text-foreground">
                Nenhum plano ativo
              </p>
              <p className="text-xs text-muted-foreground">
                Organize um plano ou periodização quando quiser.
              </p>
            </div>
          )}

          {activeContext.type === "STANDALONE_PLAN" && (
            <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  className="rounded-full px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wider"
                >
                  PLANO ATUAL
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {activeContext.plan.workoutDaysCount}{" "}
                  {activeContext.plan.workoutDaysCount === 1
                    ? "dia configurado"
                    : "dias configurados"}
                </span>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {activeContext.plan.name}
                  </h3>
                </div>

                <Link
                  href={`/workout-plans/${activeContext.plan.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-heading text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
                >
                  <span>Ver plano</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}

          {activeContext.type === "PERIODIZATION" && (
            <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  className="rounded-full px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wider"
                >
                  PERIODIZAÇÃO ATIVA
                </Badge>
                <span className="font-heading text-xs font-medium text-foreground">
                  Etapa {activeContext.periodization.currentBlock.order} de{" "}
                  {activeContext.periodization.totalBlocks}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {activeContext.periodization.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Dumbbell className="size-3.5" />
                  <span>
                    {activeContext.periodization.currentBlock.workoutPlanName}
                  </span>
                </div>
              </div>

              {/* Barra de progresso visual */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (activeContext.periodization.currentBlock.order /
                          Math.max(
                            activeContext.periodization.totalBlocks,
                            1,
                          )) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <PlannedDeadlineBadge
                  plannedEndDate={
                    activeContext.periodization.currentBlock.plannedEndDate
                  }
                />

                <Link
                  href={`/planning/periodizations/${activeContext.periodization.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-heading text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
                >
                  <span>Ver periodização</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Seção 2: Meus planos */}
        <section
          className="flex flex-col gap-3"
          aria-labelledby="section-my-plans"
        >
          <div className="flex items-center justify-between">
            <h2
              id="section-my-plans"
              className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Meus planos ({plans.length})
            </h2>
          </div>

          {plans.length === 0 ? (
            <div className="flex flex-col gap-1 rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center">
              <p className="font-heading text-sm font-medium text-foreground">
                Você ainda não tem nenhum plano de treino criado.
              </p>
              <p className="text-xs text-muted-foreground">
                Crie um plano para estruturar sua rotina de exercícios.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {plans.map((plan) => (
                <WorkoutPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </section>

        {/* Seção 3: Minhas periodizações */}
        <section
          className="flex flex-col gap-3"
          aria-labelledby="section-my-periodizations"
        >
          <div className="flex items-center justify-between">
            <h2
              id="section-my-periodizations"
              className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Minhas periodizações ({periodizations.length})
            </h2>
          </div>

          {periodizations.length === 0 ? (
            <div className="flex flex-col gap-1 rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center">
              <p className="font-heading text-sm font-medium text-foreground">
                Você ainda não criou nenhuma periodização.
              </p>
              <p className="text-xs text-muted-foreground">
                Agrupe seus planos em etapas quando quiser organizar um ciclo.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {periodizations.map(
                (periodization: GetPlanningOverview200PeriodizationsItem) => {
                  let statusLabel = "RASCUNHO";
                  let statusVariant: "default" | "secondary" | "outline" =
                    "secondary";
                  let progressText = `${periodization.totalBlocks} etapas`;

                  if (periodization.status === "ACTIVE") {
                    statusLabel = "ATIVA";
                    statusVariant = "default";
                    progressText = `${periodization.completedBlocks} de ${periodization.totalBlocks} etapas concluídas`;
                  } else if (periodization.status === "PAUSED") {
                    statusLabel = "PAUSADA";
                    statusVariant = "secondary";
                    progressText = periodization.currentBlock
                      ? `Última etapa: ${periodization.currentBlock.workoutPlanName}`
                      : "Não iniciada";
                  } else if (periodization.status === "COMPLETED") {
                    statusLabel = "CONCLUÍDA";
                    statusVariant = "outline";
                    progressText = `${periodization.completedBlocks} de ${periodization.totalBlocks} etapas executadas`;
                  }

                  return (
                    <Link
                      key={periodization.id}
                      href={`/planning/periodizations/${periodization.id}`}
                      className="group flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <CalendarRange className="size-4 text-primary shrink-0" />
                            <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {periodization.name}
                            </h3>
                          </div>
                          {periodization.goal && (
                            <p className="text-xs text-muted-foreground line-clamp-1 pl-6">
                              {periodization.goal}
                            </p>
                          )}
                        </div>

                        <Badge
                          variant={statusVariant}
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0"
                        >
                          {statusLabel}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground pl-6">
                        <span className="font-medium text-foreground/80">
                          {progressText}
                        </span>
                        <div className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                          <span className="text-[11px] font-semibold">
                            Detalhes
                          </span>
                          <ChevronRight className="size-3.5" />
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          )}
        </section>
      </main>

      <BottomNav activePage="planning" />
    </div>
  );
}
