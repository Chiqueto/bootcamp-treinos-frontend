"use server";

import {
  getExerciseEvolution,
  getMuscleTrainingAnalytics,
  getWeeklyTrainingAnalytics,
  listExercises,
  type GetExerciseEvolution200,
  type GetMuscleTrainingAnalytics200,
  type GetWeeklyTrainingAnalytics200,
  type ListExercises200Item,
} from "@/app/_lib/api/fetch-generated";

export type EvolutionRange = 4 | 8 | 12;

export type EvolutionDashboardData = {
  weekly: GetWeeklyTrainingAnalytics200;
  muscles: GetMuscleTrainingAnalytics200;
};

export type EvolutionActionErrorCode =
  | "INVALID_TIMEZONE"
  | "NOT_FOUND"
  | "REQUEST_FAILED";

export type EvolutionActionResult<T> =
  | { success: true; data: T }
  | { success: false; code: EvolutionActionErrorCode; error: string };

function isValidTimeZone(timezone: string): boolean {
  if (!timezone.trim()) return false;

  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function isEvolutionRange(value: number): value is EvolutionRange {
  return value === 4 || value === 8 || value === 12;
}

function getResponseCode(response: { data: unknown }): string | undefined {
  return (response.data as { code?: string } | null)?.code;
}

export async function loadEvolutionDashboard(input: {
  timezone: string;
  weeksCount: number;
}): Promise<EvolutionActionResult<EvolutionDashboardData>> {
  if (!isValidTimeZone(input.timezone)) {
    return {
      success: false,
      code: "INVALID_TIMEZONE",
      error: "Não foi possível determinar corretamente seu fuso horário.",
    };
  }
  if (!isEvolutionRange(input.weeksCount)) {
    return {
      success: false,
      code: "REQUEST_FAILED",
      error: "Período de evolução inválido.",
    };
  }

  try {
    const weeklyResponse = await getWeeklyTrainingAnalytics({
      tz: input.timezone,
      weeksCount: input.weeksCount,
    });
    if (weeklyResponse.status !== 200) {
      const invalidTimezone =
        getResponseCode(weeklyResponse) === "INVALID_TIMEZONE";
      return {
        success: false,
        code: invalidTimezone ? "INVALID_TIMEZONE" : "REQUEST_FAILED",
        error: invalidTimezone
          ? "Não foi possível determinar corretamente seu fuso horário."
          : "Não foi possível carregar seus dados de evolução.",
      };
    }

    const muscleResponse = await getMuscleTrainingAnalytics({
      tz: input.timezone,
      startDate: weeklyResponse.data.startDate,
      endDate: weeklyResponse.data.endDate,
    });
    if (muscleResponse.status !== 200) {
      const invalidTimezone =
        getResponseCode(muscleResponse) === "INVALID_TIMEZONE";
      return {
        success: false,
        code: invalidTimezone ? "INVALID_TIMEZONE" : "REQUEST_FAILED",
        error: invalidTimezone
          ? "Não foi possível determinar corretamente seu fuso horário."
          : "Não foi possível carregar a distribuição muscular.",
      };
    }

    return {
      success: true,
      data: {
        weekly: weeklyResponse.data,
        muscles: muscleResponse.data,
      },
    };
  } catch (error) {
    console.error("Failed to load evolution dashboard:", error);
    return {
      success: false,
      code: "REQUEST_FAILED",
      error: "Não foi possível carregar seus dados de evolução.",
    };
  }
}

export async function searchEvolutionExercises(
  query: string,
  onlyWithHistory = false,
): Promise<EvolutionActionResult<ListExercises200Item[]>> {
  const normalizedQuery = query.trim();

  try {
    const params: { q?: string; onlyWithHistory?: string } = {};
    if (normalizedQuery) params.q = normalizedQuery;
    if (onlyWithHistory) params.onlyWithHistory = "true";

    const response = await listExercises(params);
    if (response.status !== 200) {
      return {
        success: false,
        code: "REQUEST_FAILED",
        error: "Não foi possível buscar exercícios.",
      };
    }

    // Deduplicação defensiva no frontend por nome normalizado
    const uniqueMap = new Map<string, ListExercises200Item>();
    for (const item of response.data) {
      const key = item.name.toLowerCase().trim();
      if (!uniqueMap.has(key) || item.ownerUserId !== null) {
        uniqueMap.set(key, item);
      }
    }

    return { success: true, data: Array.from(uniqueMap.values()).slice(0, 15) };
  } catch (error) {
    console.error("Failed to search evolution exercises:", error);
    return {
      success: false,
      code: "REQUEST_FAILED",
      error: "Não foi possível buscar exercícios.",
    };
  }
}

export async function loadInitialEvolutionExercises(): Promise<
  EvolutionActionResult<ListExercises200Item[]>
> {
  return searchEvolutionExercises("", true);
}

export async function loadExerciseEvolutionPage(input: {
  exerciseId: string;
  cursor: string;
}): Promise<EvolutionActionResult<GetExerciseEvolution200>> {
  if (!input.exerciseId.trim() || !input.cursor) {
    return {
      success: false,
      code: "REQUEST_FAILED",
      error: "Não foi possível carregar mais sessões.",
    };
  }

  try {
    const response = await getExerciseEvolution(input.exerciseId, {
      cursor: input.cursor,
      limit: 10,
    });
    if (response.status === 404) {
      return {
        success: false,
        code: "NOT_FOUND",
        error: "Exercício não encontrado.",
      };
    }
    if (response.status !== 200) {
      return {
        success: false,
        code: "REQUEST_FAILED",
        error: "Não foi possível carregar mais sessões.",
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to load exercise evolution page:", error);
    return {
      success: false,
      code: "REQUEST_FAILED",
      error: "Não foi possível carregar mais sessões.",
    };
  }
}
