"use server";

import { revalidatePath } from "next/cache";
import {
  createWorkoutSet,
  deleteWorkoutSet,
  updateWorkoutSet,
  type CreateWorkoutSet201,
  type CreateWorkoutSetBody,
  type UpdateWorkoutSet200,
  type UpdateWorkoutSetBody,
} from "@/app/_lib/api/fetch-generated";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Cria uma nova série para o SessionExercise especificado.
 */
export async function createWorkoutSetAction(
  sessionId: string,
  sessionExerciseId: string,
  body: CreateWorkoutSetBody = {},
): Promise<ActionResult<CreateWorkoutSet201>> {
  try {
    const response = await createWorkoutSet(sessionExerciseId, body);
    if (response.status !== 201) {
      const errorMsg =
        (response.data as { error?: string })?.error || "Erro ao criar série";
      return { success: false, error: errorMsg };
    }

    revalidatePath(`/workout-sessions/${sessionId}`);
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao criar série",
    };
  }
}

/**
 * Atualiza os valores parciais de uma série existente.
 */
export async function updateWorkoutSetAction(
  sessionId: string,
  setId: string,
  body: UpdateWorkoutSetBody,
): Promise<ActionResult<UpdateWorkoutSet200>> {
  try {
    const response = await updateWorkoutSet(setId, body);
    if (response.status !== 200) {
      const errorMsg =
        (response.data as { error?: string })?.error ||
        "Erro ao atualizar série";
      return { success: false, error: errorMsg };
    }

    revalidatePath(`/workout-sessions/${sessionId}`);
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao atualizar série",
    };
  }
}

/**
 * Remove uma série da sessão aberta.
 */
export async function deleteWorkoutSetAction(
  sessionId: string,
  setId: string,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const response = await deleteWorkoutSet(setId);
    if (response.status !== 200) {
      const errorMsg =
        (response.data as { error?: string })?.error ||
        "Erro ao remover série";
      return { success: false, error: errorMsg };
    }

    revalidatePath(`/workout-sessions/${sessionId}`);
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao remover série",
    };
  }
}
