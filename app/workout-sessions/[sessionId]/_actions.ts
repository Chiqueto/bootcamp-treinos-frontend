"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addExerciseToWorkoutSession,
  completeWorkoutSession,
  createExercise,
  createWorkoutSet,
  deleteWorkoutSet,
  listExercises,
  removeExerciseFromWorkoutSession,
  startFreeWorkoutSession,
  updateWorkoutSet,
  type AddExerciseToWorkoutSession201,
  type CompleteWorkoutSession200,
  type CreateExercise201,
  type CreateWorkoutSet201,
  type CreateWorkoutSetBody,
  type ListExercises200Item,
  type RemoveExerciseFromWorkoutSession200,
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

    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao remover série",
    };
  }
}

/**
 * Conclui a sessão de treino ativa.
 */
export async function completeWorkoutSessionAction(
  sessionId: string,
): Promise<ActionResult<CompleteWorkoutSession200>> {
  try {
    const response = await completeWorkoutSession(sessionId);
    if (response.status !== 200) {
      const errorMsg =
        (response.data as { error?: string })?.error ||
        "Erro ao finalizar treino";
      return { success: false, error: errorMsg };
    }

    revalidatePath(`/workout-sessions/${sessionId}`);
    revalidatePath("/");
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao finalizar treino",
    };
  }
}

/**
 * Inicia uma sessão de treino avulsa e redireciona para a tela do tracker.
 */
export async function startFreeWorkoutAction(): Promise<void> {
  const response = await startFreeWorkoutSession();
  if (response.status !== 201) {
    const errorData = response.data as { error?: string };
    throw new Error(errorData?.error || "Erro ao iniciar treino avulso");
  }

  const sessionId = response.data.userWorkoutSessionId;
  revalidatePath("/");
  redirect(`/workout-sessions/${sessionId}`);
}

/**
 * Lista exercícios globais e próprios com filtro opcional.
 */
export async function listExercisesAction(
  query?: string,
): Promise<ActionResult<ListExercises200Item[]>> {
  try {
    const response = await listExercises(query ? { q: query } : undefined);
    if (response.status !== 200) {
      const errorMsg =
        (response.data as { error?: string })?.error ||
        "Erro ao listar exercícios";
      return { success: false, error: errorMsg };
    }

    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao listar exercícios",
    };
  }
}

/**
 * Cria um exercício personalizado para o usuário logado.
 */
export async function createExerciseAction(
  name: string,
): Promise<ActionResult<CreateExercise201>> {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Nome do exercício é obrigatório" };
    }

    const response = await createExercise({ name: trimmed });
    if (response.status !== 201) {
      const errorMsg =
        (response.data as { error?: string })?.error ||
        "Erro ao criar exercício";
      return { success: false, error: errorMsg };
    }

    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao criar exercício",
    };
  }
}

/**
 * Adiciona um exercício do catálogo a uma sessão avulsa aberta.
 */
export async function addExerciseToWorkoutSessionAction(
  sessionId: string,
  exerciseId: string,
): Promise<ActionResult<AddExerciseToWorkoutSession201>> {
  try {
    const response = await addExerciseToWorkoutSession(sessionId, {
      exerciseId,
    });
    if (response.status !== 201) {
      const errorMsg =
        (response.data as { error?: string })?.error ||
        "Erro ao adicionar exercício";
      return { success: false, error: errorMsg };
    }

    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        (err as Error)?.message || "Erro de conexão ao adicionar exercício",
    };
  }
}

/**
 * Remove um exercício de uma sessão avulsa aberta.
 */
export async function removeExerciseFromWorkoutSessionAction(
  sessionId: string,
  sessionExerciseId: string,
): Promise<ActionResult<RemoveExerciseFromWorkoutSession200>> {
  try {
    const response = await removeExerciseFromWorkoutSession(sessionExerciseId);
    if (response.status !== 200) {
      const errorMsg =
        (response.data as { error?: string })?.error ||
        "Erro ao remover exercício";
      return { success: false, error: errorMsg };
    }

    return { success: true, data: response.data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro de conexão ao remover exercício",
    };
  }
}

