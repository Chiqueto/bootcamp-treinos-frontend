"use server";

import {
  listWorkoutHistory,
  type ListWorkoutHistory200,
  type ListWorkoutHistoryOrigin,
} from "@/app/_lib/api/fetch-generated";

export type LoadWorkoutHistoryPageResult =
  | { success: true; data: ListWorkoutHistory200 }
  | { success: false; error: string };

export async function loadWorkoutHistoryPage(input: {
  cursor?: string;
  origin?: ListWorkoutHistoryOrigin;
}): Promise<LoadWorkoutHistoryPageResult> {
  if (
    input.origin !== undefined &&
    input.origin !== "PLANNED" &&
    input.origin !== "FREE"
  ) {
    return { success: false, error: "Filtro de histórico inválido." };
  }
  if (input.cursor !== undefined && typeof input.cursor !== "string") {
    return { success: false, error: "Cursor de histórico inválido." };
  }

  try {
    const response = await listWorkoutHistory({
      ...(input.cursor ? { cursor: input.cursor } : {}),
      ...(input.origin ? { origin: input.origin } : {}),
    });

    if (response.status !== 200) {
      return {
        success: false,
        error: "Não foi possível carregar seu histórico.",
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to load workout history page:", error);
    return {
      success: false,
      error: "Não foi possível carregar seu histórico.",
    };
  }
}
