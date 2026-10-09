import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getStats, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import dayjs from "dayjs";
import { CircleCheck, CirclePercent, Hourglass } from "lucide-react";
import { BottomNav } from "@/app/_components/bottom-nav";
import { StreakBanner } from "./_components/streak-banner";
import { StatsHeatmap } from "./_components/stats-heatmap";
import { StatCard } from "./_components/stat-card";
import { EvolutionDashboard } from "./_components/evolution-dashboard";

function formatTotalTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h${minutes.toString().padStart(2, "0")}m`;
}

export default async function StatsPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();
  const from = today
    .subtract(2, "month")
    .startOf("month")
    .subtract(7, "day")
    .format("YYYY-MM-DD");
  const to = today.endOf("month").add(7, "day").format("YYYY-MM-DD");

  const [statsResponse, trainData] = await Promise.all([
    getStats({ from, to, timezoneOffset: today.utcOffset() }),
    getUserTrainData(),
  ]);

  const needsOnboarding =
    (trainData.status === 200 && !trainData.data) || trainData.status === 404;
  if (needsOnboarding) redirect("/onboarding");

  if (statsResponse.status !== 200) {
    throw new Error("Failed to fetch stats");
  }

  const {
    workoutStreak,
    consistencyByDay,
    completedWorkoutsCount,
    conclusionRate,
    totalTimeInSeconds,
  } = statsResponse.data;

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-5">
        <p
          className="text-[22px] uppercase leading-[1.15] text-foreground"
          style={{ fontFamily: "var(--font-anton)" }}
        >
          Trainvy
        </p>
      </div>

      <main className="mx-auto w-full max-w-3xl px-4 pb-6 sm:px-6">
        <header className="pb-5 pt-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Evolução
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe seu treino ao longo do tempo
          </p>
        </header>

        <EvolutionDashboard />

        <section aria-labelledby="consistency-title" className="mt-8">
          <div className="mb-3">
            <p className="text-xs text-muted-foreground">Visão complementar</p>
            <h2
              id="consistency-title"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Consistência
            </h2>
          </div>

          <StreakBanner workoutStreak={workoutStreak} />

          <div className="mt-3 flex flex-col gap-3">
            <StatsHeatmap consistencyByDay={consistencyByDay} today={today} />

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={CircleCheck}
                value={String(completedWorkoutsCount)}
                label="Treinos Feitos"
              />
              <StatCard
                icon={CirclePercent}
                value={`${Math.round(conclusionRate * 100)}%`}
                label="Taxa de conclusão"
              />
            </div>

            <StatCard
              icon={Hourglass}
              value={formatTotalTime(totalTimeInSeconds)}
              label="Tempo Total"
            />
          </div>
        </section>
      </main>

      <BottomNav activePage="stats" />
    </div>
  );
}
