import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  activateWorkoutPlan: vi.fn(),
  deactivateWorkoutPlan: vi.fn(),
  duplicateWorkoutPlan: vi.fn(),
  activatePeriodization: vi.fn(),
  deactivatePeriodization: vi.fn(),
  advancePeriodization: vi.fn(),
  completePeriodization: vi.fn(),
  createPeriodization: vi.fn(),
  updatePeriodization: vi.fn(),
  deletePeriodization: vi.fn(),
  addWorkoutPlanToPeriodization: vi.fn(),
  createWorkoutPlanInPeriodization: vi.fn(),
  updatePeriodizationPlan: vi.fn(),
  removeWorkoutPlanFromPeriodization: vi.fn(),
  reorderPeriodizationPlans: vi.fn(),
  createWorkoutPlan: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/app/_lib/api/fetch-generated", () => ({
  activateWorkoutPlan: mocks.activateWorkoutPlan,
  deactivateWorkoutPlan: mocks.deactivateWorkoutPlan,
  duplicateWorkoutPlan: mocks.duplicateWorkoutPlan,
  activatePeriodization: mocks.activatePeriodization,
  deactivatePeriodization: mocks.deactivatePeriodization,
  advancePeriodization: mocks.advancePeriodization,
  completePeriodization: mocks.completePeriodization,
  createPeriodization: mocks.createPeriodization,
  updatePeriodization: mocks.updatePeriodization,
  deletePeriodization: mocks.deletePeriodization,
  addWorkoutPlanToPeriodization: mocks.addWorkoutPlanToPeriodization,
  createWorkoutPlanInPeriodization: mocks.createWorkoutPlanInPeriodization,
  updatePeriodizationPlan: mocks.updatePeriodizationPlan,
  removeWorkoutPlanFromPeriodization: mocks.removeWorkoutPlanFromPeriodization,
  reorderPeriodizationPlans: mocks.reorderPeriodizationPlans,
  createWorkoutPlan: mocks.createWorkoutPlan,
}));

import {
  activatePeriodizationAction,
  activateWorkoutPlanAction,
  advancePeriodizationAction,
  completePeriodizationAction,
  createPeriodizationAction,
  createStandaloneWorkoutPlanAction,
  createWorkoutPlanInPeriodizationAction,
  deletePeriodizationAction,
  deactivatePeriodizationAction,
  deactivateWorkoutPlanAction,
  duplicateWorkoutPlanAction,
  addWorkoutPlanToPeriodizationAction,
  removeWorkoutPlanFromPeriodizationAction,
  reorderPeriodizationPlansAction,
  updatePeriodizationAction,
  updatePeriodizationPlanAction,
} from "@/app/planning/_actions";
import { getPlanningErrorMessage } from "@/app/planning/_lib/planning-errors";

const planResponse = {
  id: "plan-1",
  name: "Força",
  isActive: true,
};

const periodizationResponse = {
  id: "periodization-1",
  name: "Pré-temporada",
  status: "ACTIVE",
  startedAt: "2026-09-01T10:00:00.000Z",
  completedAt: null,
  currentBlock: null,
};

describe("planning Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ativa um plano standalone e invalida Hub, Home e detalhe", async () => {
    mocks.activateWorkoutPlan.mockResolvedValue({
      status: 200,
      data: planResponse,
    });

    const result = await activateWorkoutPlanAction("plan-1");

    expect(result).toEqual({ success: true, data: planResponse });
    expect(mocks.activateWorkoutPlan).toHaveBeenCalledWith("plan-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/planning");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/workout-plans/plan-1");
  });

  it("desativa plano e duplica uma cópia inativa com nome normalizado", async () => {
    mocks.deactivateWorkoutPlan.mockResolvedValue({
      status: 200,
      data: { ...planResponse, isActive: false },
    });
    mocks.duplicateWorkoutPlan.mockResolvedValue({
      status: 201,
      data: {
        id: "plan-copy",
        name: "Força - Minha cópia",
        isActive: false,
        workoutDays: [],
      },
    });

    const deactivateResult = await deactivateWorkoutPlanAction("plan-1");
    const duplicateResult = await duplicateWorkoutPlanAction(
      "plan-1",
      "  Força - Minha cópia  ",
    );

    expect(deactivateResult.success).toBe(true);
    expect(duplicateResult.success).toBe(true);
    expect(mocks.deactivateWorkoutPlan).toHaveBeenCalledWith("plan-1");
    expect(mocks.duplicateWorkoutPlan).toHaveBeenCalledWith("plan-1", {
      name: "Força - Minha cópia",
    });
  });

  it("valida ids e nome da cópia antes de chamar a API", async () => {
    await expect(activateWorkoutPlanAction(" ")).resolves.toMatchObject({
      success: false,
      code: "INVALID_INPUT",
    });
    await expect(duplicateWorkoutPlanAction("plan-1", " ")).resolves.toEqual({
      success: false,
      error: "Informe o nome da cópia.",
      code: "INVALID_INPUT",
    });
    expect(mocks.activateWorkoutPlan).not.toHaveBeenCalled();
    expect(mocks.duplicateWorkoutPlan).not.toHaveBeenCalled();
  });

  it("traduz ACTIVE_WORKOUT_SESSION sem expor o código como mensagem", async () => {
    mocks.activateWorkoutPlan.mockResolvedValue({
      status: 409,
      data: { error: "raw backend error", code: "ACTIVE_WORKOUT_SESSION" },
    });

    const result = await activateWorkoutPlanAction("plan-1");

    expect(result).toEqual({
      success: false,
      error: "Finalize seu treino atual antes de alterar o planejamento.",
      code: "ACTIVE_WORKOUT_SESSION",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("ativa, pausa, avança e encerra periodizações pelos endpoints oficiais", async () => {
    mocks.activatePeriodization.mockResolvedValue({
      status: 200,
      data: periodizationResponse,
    });
    mocks.deactivatePeriodization.mockResolvedValue({
      status: 200,
      data: { ...periodizationResponse, status: "PAUSED" },
    });
    mocks.advancePeriodization.mockResolvedValue({
      status: 200,
      data: periodizationResponse,
    });
    mocks.completePeriodization.mockResolvedValue({
      status: 200,
      data: { ...periodizationResponse, status: "COMPLETED" },
    });

    expect((await activatePeriodizationAction("periodization-1")).success).toBe(
      true,
    );
    expect(
      (await deactivatePeriodizationAction("periodization-1")).success,
    ).toBe(true);
    expect((await advancePeriodizationAction("periodization-1")).success).toBe(
      true,
    );
    expect((await completePeriodizationAction("periodization-1")).success).toBe(
      true,
    );

    expect(mocks.activatePeriodization).toHaveBeenCalledWith("periodization-1");
    expect(mocks.deactivatePeriodization).toHaveBeenCalledWith(
      "periodization-1",
    );
    expect(mocks.advancePeriodization).toHaveBeenCalledWith("periodization-1");
    expect(mocks.completePeriodization).toHaveBeenCalledWith("periodization-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/planning/periodizations/periodization-1",
    );
  });

  it("cria, edita e exclui uma periodização com revalidação", async () => {
    const created = {
      id: "periodization-new",
      name: "Pré-temporada 2027",
      goal: null,
      notes: null,
      isActive: false,
      startedAt: null,
      completedAt: null,
      createdAt: "2026-09-30T10:00:00.000Z",
      updatedAt: "2026-09-30T10:00:00.000Z",
      status: "DRAFT",
    };
    mocks.createPeriodization.mockResolvedValue({ status: 201, data: created });
    mocks.updatePeriodization.mockResolvedValue({
      status: 200,
      data: { ...created, name: "Ciclo editado" },
    });
    mocks.deletePeriodization.mockResolvedValue({
      status: 200,
      data: { success: true, message: "ok" },
    });

    expect(
      (await createPeriodizationAction({ name: "  Pré-temporada 2027  " }))
        .success,
    ).toBe(true);
    expect(
      (
        await updatePeriodizationAction("periodization-new", {
          name: " Ciclo editado ",
          goal: " Competição ",
        })
      ).success,
    ).toBe(true);
    expect((await deletePeriodizationAction("periodization-new")).success).toBe(
      true,
    );

    expect(mocks.createPeriodization).toHaveBeenCalledWith({
      name: "Pré-temporada 2027",
      goal: null,
      notes: null,
    });
    expect(mocks.updatePeriodization).toHaveBeenCalledWith(
      "periodization-new",
      {
        name: "Ciclo editado",
        goal: "Competição",
        notes: null,
      },
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/planning");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("adiciona plano existente e cria plano novo dentro da periodização", async () => {
    const block = {
      id: "block-1",
      periodizationId: "periodization-1",
      workoutPlanId: "plan-1",
      order: 1,
      plannedStartDate: null,
      plannedEndDate: null,
      activatedAt: null,
      completedAt: null,
      notes: null,
      createdAt: "2026-09-30T10:00:00.000Z",
      updatedAt: "2026-09-30T10:00:00.000Z",
      workoutPlan: { id: "plan-1", name: "Base", isActive: false },
    };
    mocks.addWorkoutPlanToPeriodization.mockResolvedValue({
      status: 201,
      data: block,
    });
    mocks.createWorkoutPlanInPeriodization.mockResolvedValue({
      status: 201,
      data: {
        ...block,
        workoutPlan: { ...block.workoutPlan, workoutDays: [] },
      },
    });

    const addResult = await addWorkoutPlanToPeriodizationAction(
      "periodization-1",
      { workoutPlanId: "plan-1" },
    );
    const createResult = await createWorkoutPlanInPeriodizationAction(
      "periodization-1",
      {
        name: "Novo bloco",
        workoutDays: [
          {
            name: "Segunda",
            weekDay: "MONDAY",
            isRest: true,
            estimatedDurationInSeconds: 0,
            exercises: [],
          },
        ],
      },
    );

    expect(addResult.success).toBe(true);
    expect(createResult.success).toBe(true);
    expect(mocks.addWorkoutPlanToPeriodization).toHaveBeenCalledWith(
      "periodization-1",
      {
        workoutPlanId: "plan-1",
        plannedStartDate: null,
        plannedEndDate: null,
        notes: null,
      },
    );
  });

  it("edita, remove e reordena somente IDs de etapas válidos", async () => {
    mocks.updatePeriodizationPlan.mockResolvedValue({
      status: 200,
      data: { id: "block-1", plannedStartDate: null, plannedEndDate: null },
    });
    mocks.removeWorkoutPlanFromPeriodization.mockResolvedValue({
      status: 200,
      data: { success: true, message: "ok" },
    });
    mocks.reorderPeriodizationPlans.mockResolvedValue({
      status: 200,
      data: [],
    });

    expect(
      (
        await updatePeriodizationPlanAction("periodization-1", "block-1", {
          notes: " Semana leve ",
        })
      ).success,
    ).toBe(true);
    expect(
      (
        await removeWorkoutPlanFromPeriodizationAction(
          "periodization-1",
          "block-1",
        )
      ).success,
    ).toBe(true);
    expect(
      (
        await reorderPeriodizationPlansAction("periodization-1", {
          periodizationPlanIds: ["block-2", "block-1"],
        })
      ).success,
    ).toBe(true);
    expect(mocks.reorderPeriodizationPlans).toHaveBeenCalledWith(
      "periodization-1",
      { periodizationPlanIds: ["block-2", "block-1"] },
    );
  });

  it("cria plano standalone com activate=false explícito por padrão", async () => {
    mocks.createWorkoutPlan.mockResolvedValue({
      status: 201,
      data: { id: "plan-new", name: "Novo", isActive: false, workoutDays: [] },
    });
    const result = await createStandaloneWorkoutPlanAction({
      name: "Novo",
      workoutDays: [
        {
          name: "Segunda",
          weekDay: "MONDAY",
          isRest: true,
          estimatedDurationInSeconds: 0,
          exercises: [],
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(mocks.createWorkoutPlan).toHaveBeenCalledWith(
      expect.objectContaining({ activate: false }),
    );
  });

  it("rejeita intervalo de datas inválido antes da API", async () => {
    const result = await addWorkoutPlanToPeriodizationAction(
      "periodization-1",
      {
        workoutPlanId: "plan-1",
        plannedStartDate: "2027-02-10",
        plannedEndDate: "2027-02-01",
      },
    );
    expect(result).toMatchObject({ success: false, code: "INVALID_INPUT" });
    expect(mocks.addWorkoutPlanToPeriodization).not.toHaveBeenCalled();
  });
});

describe("getPlanningErrorMessage", () => {
  it.each([
    ["ACTIVE_WORKOUT_SESSION", "Finalize seu treino atual"],
    ["PLAN_BELONGS_TO_PERIODIZATION", "pertence a uma periodização"],
    ["PLAN_IS_ACTIVE_PERIODIZATION_BLOCK", "etapa atual"],
    ["ACTIVE_PERIODIZATION", "periodização ativa"],
    ["PERIODIZATION_HAS_NO_PLANS", "pelo menos uma etapa"],
    ["PERIODIZATION_NOT_STARTED", "ainda não foi iniciada"],
    ["PERIODIZATION_NOT_ACTIVE", "não está ativa"],
    ["PERIODIZATION_COMPLETED", "já foi concluída"],
    ["NO_OPEN_BLOCK", "Não há uma etapa"],
    ["INCONSISTENT_PLANNING_STATE", "estado está inconsistente"],
    ["PLAN_ALREADY_IN_PERIODIZATION", "já faz parte"],
    ["ACTIVE_PLAN_CANNOT_BE_ATTACHED", "Desative o plano"],
    ["ACTIVE_BLOCK_CANNOT_BE_REMOVED", "em andamento"],
    ["COMPLETED_BLOCK_CANNOT_BE_REMOVED", "concluída"],
    ["COMPLETED_BLOCK_IMMUTABLE", "estrutura alterada"],
    ["INVALID_REORDER_BLOCKS", "nova ordem"],
    ["PERIODIZATION_ALREADY_STARTED", "já iniciada"],
  ])("mapeia %s para uma mensagem humana", (code, expectedText) => {
    expect(getPlanningErrorMessage(code)).toContain(expectedText);
  });

  it("usa uma mensagem segura para códigos desconhecidos", () => {
    expect(getPlanningErrorMessage("SOMETHING_NEW")).not.toContain(
      "SOMETHING_NEW",
    );
  });
});
