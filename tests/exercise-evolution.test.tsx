import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/stats/_actions", () => ({
  loadExerciseEvolutionPage: vi.fn(),
}));

import type {
  GetExerciseEvolution200,
  GetExerciseEvolution200ItemsItem,
} from "@/app/_lib/api/fetch-generated";
import { loadExerciseEvolutionPage } from "@/app/stats/_actions";
import { ExerciseEvolutionDetail } from "@/app/stats/exercises/[exerciseId]/_components/exercise-evolution-detail";

function evolutionItem(
  workoutSessionId: string,
  overrides: Partial<GetExerciseEvolution200ItemsItem> = {},
): GetExerciseEvolution200ItemsItem {
  return {
    workoutSessionId,
    startedAt: "2026-10-01T18:00:00.000Z",
    completedAt: "2026-10-01T19:00:00.000Z",
    origin: "PLANNED",
    workoutPlanNameSnapshot: "Hipertrofia",
    workoutDayNameSnapshot: "Upper A",
    exerciseNameSnapshot: "Supino Reto",
    workingSetsCount: 3,
    totalReps: 24,
    loadVolumeGrams: 2_020_000,
    loadVolumeKg: 2020,
    topSet: {
      workoutSetId: `top-${workoutSessionId}`,
      weightInGrams: 85_000,
      weightKg: 85,
      reps: 8,
      rir: 2,
    },
    sets: [
      {
        id: `set-${workoutSessionId}-1`,
        sessionExerciseId: `session-exercise-${workoutSessionId}`,
        order: 1,
        weightInGrams: 82_500,
        weightKg: 82.5,
        reps: 8,
        rir: 2,
        durationInSeconds: null,
        notes: "Execução controlada",
        completedAt: "2026-10-01T18:30:00.000Z",
      },
      {
        id: `set-${workoutSessionId}-2`,
        sessionExerciseId: `session-exercise-${workoutSessionId}`,
        order: 2,
        weightInGrams: null,
        weightKg: null,
        reps: null,
        rir: null,
        durationInSeconds: 75,
        notes: null,
        completedAt: "2026-10-01T18:35:00.000Z",
      },
    ],
    ...overrides,
  };
}

function evolutionData(
  overrides: Partial<GetExerciseEvolution200> = {},
): GetExerciseEvolution200 {
  return {
    exercise: {
      id: "exercise-1",
      name: "Supino Reto Barra",
      ownerUserId: null,
      muscles: [
        { muscleGroup: "CHEST", role: "PRIMARY" },
        { muscleGroup: "TRICEPS", role: "SECONDARY" },
        { muscleGroup: "SHOULDERS", role: "SECONDARY" },
      ],
    },
    loadPR: {
      weightInGrams: 100_000,
      weightKg: 100,
      reps: 5,
      rir: 1,
      completedAt: "2026-10-01T19:00:00.000Z",
      workoutSessionId: "session-pr",
      sessionExerciseId: "session-exercise-pr",
      workoutSetId: "set-pr",
      origin: "PLANNED",
      workoutPlanNameSnapshot: "Hipertrofia",
      workoutDayNameSnapshot: "Upper A",
    },
    items: [evolutionItem("session-1")],
    nextCursor: null,
    hasMore: false,
    ...overrides,
  };
}

describe("Exercise evolution detail", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("renderiza metadata, loadPR oficial, top set, volume, séries e link do histórico", () => {
    render(<ExerciseEvolutionDetail initialData={evolutionData()} />);

    expect(
      screen.getByRole("heading", { name: "Supino Reto Barra" }),
    ).toBeDefined();
    expect(screen.getByText(/Peito · principal/i)).toBeDefined();
    expect(screen.getByText(/Tríceps · secundário/i)).toBeDefined();
    expect(screen.getByText("100 kg")).toBeDefined();
    expect(screen.getByText("× 5 reps")).toBeDefined();
    expect(screen.getByText("RIR 1")).toBeDefined();
    expect(screen.getByText("85 kg · 8 reps · RIR 2")).toBeDefined();
    expect(screen.getByText(/3 séries · 24 reps ·/i)).toBeDefined();
    expect(screen.getByText("82,5 kg · 8 reps · RIR 2")).toBeDefined();
    expect(screen.getByText("1min 15s")).toBeDefined();
    expect(screen.getByText("Execução controlada")).toBeDefined();
    expect(
      screen
        .getByRole("link", { name: "Ver treino completo" })
        .getAttribute("href"),
    ).toBe("/history/session-1");
  });

  it("mostra ausência de PR sem ocultar histórico", () => {
    render(
      <ExerciseEvolutionDetail initialData={evolutionData({ loadPR: null })} />,
    );

    expect(
      screen.getByText("Nenhum PR de carga registrado ainda."),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { name: /Histórico de Execuções/i }),
    ).toBeDefined();
  });

  it("gráfico mantém carga fracionária sem arredondar e abre os detalhes", () => {
    render(
      <ExerciseEvolutionDetail
        initialData={evolutionData({
          items: [
            evolutionItem("fractional", {
              topSet: {
                workoutSetId: "fractional-set",
                weightInGrams: 82500,
                weightKg: 82.5,
                reps: 8,
                rir: 2,
              },
            }),
          ],
        })}
      />,
    );
    const bar = screen.getByRole("button", { name: /82,5 kg, 8 reps/i });
    expect(bar.textContent).toContain("82,5 kg");
    expect(bar.textContent).not.toContain("83kg");
    fireEvent.click(bar);
    expect(
      screen.getAllByText("82,5 kg · 8 reps · RIR 2").length,
    ).toBeGreaterThan(1);
  });

  it("diferencia exercício válido sem histórico de um 404", () => {
    render(
      <ExerciseEvolutionDetail
        initialData={evolutionData({ loadPR: null, items: [] })}
      />,
    );

    expect(screen.getByText(/Nenhuma sessão registrada/i)).toBeDefined();
    expect(screen.queryByText("Exercício não encontrado")).toBeNull();
  });

  it("pagina, deduplica por workoutSessionId e encerra ao receber hasMore false", async () => {
    vi.mocked(loadExerciseEvolutionPage).mockResolvedValue({
      success: true,
      data: evolutionData({
        items: [evolutionItem("session-1"), evolutionItem("session-2")],
        nextCursor: null,
        hasMore: false,
      }),
    });
    render(
      <ExerciseEvolutionDetail
        initialData={evolutionData({
          nextCursor: "opaque-cursor",
          hasMore: true,
        })}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Carregar mais sessões" }),
      );
    });

    expect(loadExerciseEvolutionPage).toHaveBeenCalledWith({
      exerciseId: "exercise-1",
      cursor: "opaque-cursor",
    });
    expect(
      screen.getAllByRole("link", { name: "Ver treino completo" }),
    ).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Carregar mais sessões" }),
    ).toBeNull();
  });

  it("preserva sessões e permite retry quando load more falha", async () => {
    vi.mocked(loadExerciseEvolutionPage)
      .mockResolvedValueOnce({
        success: false,
        code: "REQUEST_FAILED",
        error: "Não foi possível carregar mais sessões.",
      })
      .mockResolvedValueOnce({
        success: true,
        data: evolutionData({
          items: [evolutionItem("session-2")],
          nextCursor: null,
          hasMore: false,
        }),
      });
    render(
      <ExerciseEvolutionDetail
        initialData={evolutionData({
          nextCursor: "opaque-cursor",
          hasMore: true,
        })}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Carregar mais sessões" }),
      );
    });
    expect(
      screen.getByText("Não foi possível carregar mais sessões."),
    ).toBeDefined();
    expect(
      screen.getAllByRole("link", { name: "Ver treino completo" }),
    ).toHaveLength(1);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    });
    expect(
      screen.getAllByRole("link", { name: "Ver treino completo" }),
    ).toHaveLength(2);
  });
});
