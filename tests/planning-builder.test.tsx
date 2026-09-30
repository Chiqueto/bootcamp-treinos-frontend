import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  createPeriodizationAction: vi.fn(),
  createStandaloneWorkoutPlanAction: vi.fn(),
  createWorkoutPlanInPeriodizationAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/app/planning/_actions", () => ({
  createPeriodizationAction: mocks.createPeriodizationAction,
  createStandaloneWorkoutPlanAction: mocks.createStandaloneWorkoutPlanAction,
  createWorkoutPlanInPeriodizationAction:
    mocks.createWorkoutPlanInPeriodizationAction,
}));

import { PeriodizationForm } from "@/app/planning/_components/periodization-form";
import { WorkoutPlanBuilder } from "@/app/planning/_components/workout-plan-builder";
import {
  createInitialWorkoutDays,
  serializeWorkoutDays,
  validateWorkoutPlanDraft,
} from "@/app/planning/_lib/workout-plan-builder";

describe("WorkoutPlanBuilder — lógica de contrato", () => {
  it("inicia com os sete dias da semana como descanso", () => {
    const days = createInitialWorkoutDays();
    expect(days).toHaveLength(7);
    expect(days.map((day) => day.weekDay)).toEqual([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]);
    expect(days.every((day) => day.isRest)).toBe(true);
  });

  it("serializa descanso, duração, exercícios e ordem no contrato Orval", () => {
    const days = createInitialWorkoutDays();
    days[0] = {
      ...days[0],
      isRest: false,
      name: "Treino A",
      estimatedDurationInMinutes: 50,
      exercises: [
        { name: "Agachamento", sets: 4, reps: 6, restTimeInSeconds: 120 },
        { name: "Afundo", sets: 3, reps: 10, restTimeInSeconds: 60 },
      ],
    };

    const serialized = serializeWorkoutDays(days);
    expect(serialized[0]).toMatchObject({
      name: "Treino A",
      weekDay: "MONDAY",
      isRest: false,
      estimatedDurationInSeconds: 3000,
    });
    expect(serialized[0].exercises.map((exercise) => exercise.order)).toEqual([
      0, 1,
    ]);
    expect(serialized[1]).toMatchObject({
      isRest: true,
      estimatedDurationInSeconds: 0,
      exercises: [],
    });
  });

  it("valida plano, dia de treino e intervalo de datas", () => {
    const days = createInitialWorkoutDays();
    expect(validateWorkoutPlanDraft("", days)).toBe("Informe o nome do plano.");
    expect(
      validateWorkoutPlanDraft("Plano", days, "2027-03-10", "2027-03-01"),
    ).toContain("data final");
    days[0] = { ...days[0], isRest: false, estimatedDurationInMinutes: 45 };
    expect(validateWorkoutPlanDraft("Plano", days)).toContain(
      "Adicione ao menos um exercício",
    );
  });
});

describe("WorkoutPlanBuilder — interface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createStandaloneWorkoutPlanAction.mockResolvedValue({
      success: true,
      data: {
        id: "plan-new",
        name: "Plano novo",
        isActive: false,
        workoutDays: [],
      },
    });
    mocks.createWorkoutPlanInPeriodizationAction.mockResolvedValue({
      success: true,
      data: { id: "block-new", workoutPlan: { isActive: false } },
    });
  });

  afterEach(cleanup);

  function configureMonday() {
    fireEvent.change(screen.getByLabelText("Nome do plano *"), {
      target: { value: "Plano novo" },
    });
    const mondayCard = screen.getByText("Segunda").closest("article");
    expect(mondayCard).not.toBeNull();
    fireEvent.click(within(mondayCard!).getByLabelText("Dia de descanso"));
    fireEvent.change(within(mondayCard!).getByLabelText("Nome"), {
      target: { value: "Agachamento" },
    });
  }

  it("cria standalone inativo por padrão", async () => {
    render(<WorkoutPlanBuilder mode="standalone" />);
    configureMonday();
    fireEvent.click(screen.getByRole("button", { name: "Criar plano" }));

    await waitFor(() => {
      expect(mocks.createStandaloneWorkoutPlanAction).toHaveBeenCalledOnce();
      expect(mocks.push).toHaveBeenCalledWith("/planning");
    });
    const payload = mocks.createStandaloneWorkoutPlanAction.mock.calls[0][0];
    expect(payload.activate).toBe(false);
    expect(payload.workoutDays).toHaveLength(7);
    expect(payload.workoutDays[0].exercises[0]).toMatchObject({
      name: "Agachamento",
      order: 0,
    });
  });

  it("oferece ativação explícita no standalone", async () => {
    render(<WorkoutPlanBuilder mode="standalone" />);
    configureMonday();
    fireEvent.click(screen.getByLabelText("Tornar este meu plano atual"));
    fireEvent.click(screen.getByRole("button", { name: "Criar plano" }));
    await waitFor(() =>
      expect(mocks.createStandaloneWorkoutPlanAction).toHaveBeenCalled(),
    );
    expect(
      mocks.createStandaloneWorkoutPlanAction.mock.calls[0][0].activate,
    ).toBe(true);
  });

  it("cria plano dentro da periodização sem campo de ativação", async () => {
    render(
      <WorkoutPlanBuilder
        mode="periodization"
        periodizationId="periodization-1"
      />,
    );
    configureMonday();
    expect(screen.queryByLabelText("Tornar este meu plano atual")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Criar plano e adicionar etapa" }),
    );
    await waitFor(() =>
      expect(mocks.createWorkoutPlanInPeriodizationAction).toHaveBeenCalledWith(
        "periodization-1",
        expect.not.objectContaining({ activate: expect.anything() }),
      ),
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/planning/periodizations/periodization-1",
    );
  });

  it("preserva valores após erro da API", async () => {
    mocks.createStandaloneWorkoutPlanAction.mockResolvedValue({
      success: false,
      error: "Existe uma periodização ativa.",
      code: "ACTIVE_PERIODIZATION",
    });
    render(<WorkoutPlanBuilder mode="standalone" />);
    configureMonday();
    fireEvent.change(screen.getByLabelText("Nome do plano *"), {
      target: { value: "Meu plano preservado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar plano" }));

    expect(
      await screen.findByText("Existe uma periodização ativa."),
    ).toBeDefined();
    expect(
      (screen.getByLabelText("Nome do plano *") as HTMLInputElement).value,
    ).toBe("Meu plano preservado");
  });
});

describe("PeriodizationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPeriodizationAction.mockResolvedValue({
      success: true,
      data: { id: "periodization-new", status: "DRAFT" },
    });
  });

  afterEach(cleanup);

  it("cria draft e navega ao detalhe", async () => {
    render(<PeriodizationForm />);
    fireEvent.change(screen.getByLabelText("Nome *"), {
      target: { value: "Pré-Temporada 2027" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar periodização" }));
    await waitFor(() => {
      expect(mocks.createPeriodizationAction).toHaveBeenCalledWith({
        name: "Pré-Temporada 2027",
        goal: null,
        notes: null,
      });
      expect(mocks.push).toHaveBeenCalledWith(
        "/planning/periodizations/periodization-new",
      );
    });
  });

  it("valida nome e preserva o formulário após erro", async () => {
    mocks.createPeriodizationAction.mockResolvedValue({
      success: false,
      error: "Não foi possível concluir a ação.",
    });
    render(<PeriodizationForm />);
    fireEvent.click(screen.getByRole("button", { name: "Criar periodização" }));
    expect(screen.getByText("Informe o nome da periodização.")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Nome *"), {
      target: { value: "Ciclo salvo localmente" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar periodização" }));
    expect(
      await screen.findByText("Não foi possível concluir a ação."),
    ).toBeDefined();
    expect((screen.getByLabelText("Nome *") as HTMLInputElement).value).toBe(
      "Ciclo salvo localmente",
    );
  });
});
