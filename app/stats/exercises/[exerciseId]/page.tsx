import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { BottomNav } from "@/app/_components/bottom-nav";
import { getExerciseEvolution } from "@/app/_lib/api/fetch-generated";
import { authClient } from "@/app/_lib/auth-client";
import { Button } from "@/components/ui/button";

import { ExerciseEvolutionDetail } from "./_components/exercise-evolution-detail";

export default async function ExerciseEvolutionPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (!session.data?.user) redirect("/auth");

  const { exerciseId } = await params;
  let response: Awaited<ReturnType<typeof getExerciseEvolution>> | null = null;
  try {
    response = await getExerciseEvolution(exerciseId, { limit: 10 });
  } catch (error) {
    console.error("Failed to load exercise evolution:", error);
  }

  if (!response) return <ExerciseEvolutionError />;
  if (response.status === 401) redirect("/auth");
  if (response.status === 404) notFound();
  if (response.status !== 200) return <ExerciseEvolutionError />;

  return (
    <div className="min-h-svh bg-background pb-24">
      <ExerciseEvolutionDetail initialData={response.data} />
      <BottomNav />
    </div>
  );
}

function ExerciseEvolutionError() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-5 pb-24 text-center">
      <AlertCircle className="size-9 text-destructive" aria-hidden="true" />
      <h1 className="mt-3 font-heading text-xl font-semibold text-foreground">
        Não foi possível carregar a evolução deste exercício.
      </h1>
      <Button asChild variant="outline" className="mt-5 rounded-full">
        <Link href="/stats">Voltar para Evolução</Link>
      </Button>
      <BottomNav />
    </div>
  );
}
