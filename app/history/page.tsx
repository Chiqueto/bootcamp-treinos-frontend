import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { BottomNav } from "@/app/_components/bottom-nav";
import {
  listWorkoutHistory,
  type ListWorkoutHistory200,
} from "@/app/_lib/api/fetch-generated";
import { authClient } from "@/app/_lib/auth-client";

import { HistoryTimeline } from "./_components/history-timeline";

export default async function HistoryPage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (!session.data?.user) redirect("/auth");

  let initialPage: ListWorkoutHistory200 | null = null;
  let initialError: string | null = null;

  try {
    const response = await listWorkoutHistory();
    if (response.status === 200) {
      initialPage = response.data;
    } else {
      initialError = "Não foi possível carregar seu histórico.";
    }
  } catch (error) {
    console.error("Failed to load initial workout history:", error);
    initialError = "Não foi possível carregar seu histórico.";
  }

  return (
    <div className="min-h-svh bg-background pb-24">
      <HistoryTimeline initialPage={initialPage} initialError={initialError} />
      <BottomNav />
    </div>
  );
}
