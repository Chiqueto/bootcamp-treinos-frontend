"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  startWorkoutSession,
  updateWorkoutSession,
} from "@/app/_lib/api/fetch-generated";

export async function startWorkoutAction(
  workoutPlanId: string,
  workoutDayId: string,
) {
  const response = await startWorkoutSession(workoutPlanId, workoutDayId);
  if (response.status !== 201) {
    const errorData = response.data as { error?: string };
    throw new Error(errorData?.error || "Erro ao iniciar treino");
  }

  const sessionId = response.data.userWorkoutSessionId;
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
  redirect(`/workout-sessions/${sessionId}`);
}

export async function completeWorkoutAction(
  workoutPlanId: string,
  workoutDayId: string,
  sessionId: string,
) {
  await updateWorkoutSession(workoutPlanId, workoutDayId, sessionId, {
    completedAt: new Date().toISOString(),
  });
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
}
