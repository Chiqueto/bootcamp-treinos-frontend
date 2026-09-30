"use server";

import { revalidatePath } from "next/cache";
import {
  activatePeriodization,
  activateWorkoutPlan,
  advancePeriodization,
  completePeriodization,
  deactivatePeriodization,
  deactivateWorkoutPlan,
  duplicateWorkoutPlan,
  type ActivatePeriodization200,
  type ActivateWorkoutPlan200,
  type AdvancePeriodization200,
  type CompletePeriodization200,
  type DeactivatePeriodization200,
  type DeactivateWorkoutPlan200,
  type DuplicateWorkoutPlan201,
} from "@/app/_lib/api/fetch-generated";
import { getPlanningErrorMessage } from "./_lib/planning-errors";

export type PlanningActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

type ApiError = { error?: string; code?: string };

function invalidInput(message: string): PlanningActionResult<never> {
  return { success: false, error: message, code: "INVALID_INPUT" };
}

function apiError(data: unknown): PlanningActionResult<never> {
  const code = (data as ApiError | undefined)?.code;
  return {
    success: false,
    error: getPlanningErrorMessage(code),
    ...(code ? { code } : {}),
  };
}

function connectionError(error: unknown): PlanningActionResult<never> {
  console.error("Planning mutation failed:", error);
  return {
    success: false,
    error: "Não foi possível conectar ao servidor. Tente novamente.",
    code: "CONNECTION_ERROR",
  };
}

function revalidatePlanning(detailPath?: string) {
  revalidatePath("/planning");
  revalidatePath("/");
  if (detailPath) revalidatePath(detailPath);
}

function validId(id: string): string | null {
  if (typeof id !== "string") return null;
  const normalized = id.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function activateWorkoutPlanAction(
  id: string,
): Promise<PlanningActionResult<ActivateWorkoutPlan200>> {
  const planId = validId(id);
  if (!planId) return invalidInput("Plano inválido.");

  try {
    const response = await activateWorkoutPlan(planId);
    if (response.status !== 200) return apiError(response.data);

    revalidatePlanning(`/workout-plans/${planId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return connectionError(error);
  }
}

export async function deactivateWorkoutPlanAction(
  id: string,
): Promise<PlanningActionResult<DeactivateWorkoutPlan200>> {
  const planId = validId(id);
  if (!planId) return invalidInput("Plano inválido.");

  try {
    const response = await deactivateWorkoutPlan(planId);
    if (response.status !== 200) return apiError(response.data);

    revalidatePlanning(`/workout-plans/${planId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return connectionError(error);
  }
}

export async function duplicateWorkoutPlanAction(
  id: string,
  name: string,
): Promise<PlanningActionResult<DuplicateWorkoutPlan201>> {
  const planId = validId(id);
  const copyName = typeof name === "string" ? name.trim() : "";
  if (!planId) return invalidInput("Plano inválido.");
  if (!copyName) return invalidInput("Informe o nome da cópia.");

  try {
    const response = await duplicateWorkoutPlan(planId, { name: copyName });
    if (response.status !== 201) return apiError(response.data);

    revalidatePlanning(`/workout-plans/${planId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return connectionError(error);
  }
}

export async function activatePeriodizationAction(
  id: string,
): Promise<PlanningActionResult<ActivatePeriodization200>> {
  const periodizationId = validId(id);
  if (!periodizationId) return invalidInput("Periodização inválida.");

  try {
    const response = await activatePeriodization(periodizationId);
    if (response.status !== 200) return apiError(response.data);

    revalidatePlanning(`/planning/periodizations/${periodizationId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return connectionError(error);
  }
}

export async function deactivatePeriodizationAction(
  id: string,
): Promise<PlanningActionResult<DeactivatePeriodization200>> {
  const periodizationId = validId(id);
  if (!periodizationId) return invalidInput("Periodização inválida.");

  try {
    const response = await deactivatePeriodization(periodizationId);
    if (response.status !== 200) return apiError(response.data);

    revalidatePlanning(`/planning/periodizations/${periodizationId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return connectionError(error);
  }
}

export async function advancePeriodizationAction(
  id: string,
): Promise<PlanningActionResult<AdvancePeriodization200>> {
  const periodizationId = validId(id);
  if (!periodizationId) return invalidInput("Periodização inválida.");

  try {
    const response = await advancePeriodization(periodizationId);
    if (response.status !== 200) return apiError(response.data);

    revalidatePlanning(`/planning/periodizations/${periodizationId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return connectionError(error);
  }
}

export async function completePeriodizationAction(
  id: string,
): Promise<PlanningActionResult<CompletePeriodization200>> {
  const periodizationId = validId(id);
  if (!periodizationId) return invalidInput("Periodização inválida.");

  try {
    const response = await completePeriodization(periodizationId);
    if (response.status !== 200) return apiError(response.data);

    revalidatePlanning(`/planning/periodizations/${periodizationId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return connectionError(error);
  }
}
