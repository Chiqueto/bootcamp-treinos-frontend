/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/history/_actions", () => ({
  loadWorkoutHistoryPage: vi.fn(),
}));

import type {
  GetWorkoutHistorySession200,
  ListWorkoutHistory200ItemsItem,
} from "@/app/_lib/api/fetch-generated";
import { HistorySessionCard } from "@/app/history/_components/history-session-card";
import { HistorySessionDetail } from "@/app/history/_components/history-session-detail";
import { HistoryTimeline } from "@/app/history/_components/history-timeline";
import { loadWorkoutHistoryPage } from "@/app/history/_actions";

let intersectionCallback: IntersectionObserverCallback | null = null;

function historyItem(
  id: string,
  override: Partial<ListWorkoutHistory200ItemsItem> = {},
): ListWorkoutHistory200ItemsItem {
  return {
    id,
    origin: "PLANNED",
    startedAt: "2026-10-06T18:30:00.000Z",
    completedAt: "2026-10-06T19:32:00.000Z",
    durationInSeconds: 3720,
    workoutPlanId: "00000000-0000-4000-8000-000000000001",
    workoutPlanNameSnapshot: "Hipertrofia",
    workoutDayNameSnapshot: "Upper A",
    exercisesCount: 6,
    workingSetsCount: 17,
    warmupSetsCount: 2,
    totalLoadVolumeGrams: 8420000,
    totalLoadVolumeKg: 8420,
    ...override,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

const plannedDetail: GetWorkoutHistorySession200 = {
  id: "00000000-0000-4000-8000-000000000010",
  origin: "PLANNED",
  startedAt: "2026-10-06T18:30:00.000Z",
  completedAt: "2026-10-06T19:32:00.000Z",
  durationInSeconds: 3720,
  workoutPlanId: "00000000-0000-4000-8000-000000000001",
  workoutPlanNameSnapshot: "Hipertrofia",
  workoutDayNameSnapshot: "Upper A",
  summary: {
    exercisesCount: 2,
    workingSetsCount: 2,
    warmupSetsCount: 1,
    totalLoadVolumeGrams: 1140000,
    totalLoadVolumeKg: 1140,
  },
  exercises: [
    {
      id: "00000000-0000-4000-8000-000000000011",
      exerciseId: "00000000-0000-4000-8000-000000000012",
      exerciseNameSnapshot: "Supino Reto Histórico",
      order: 1,
      notes: "Manter escápulas estáveis.",
      planned: {
        warmupSets: 2,
        workingSets: 3,
        reps: 8,
        restTimeInSeconds: 90,
      },
      performed: {
        warmupSetsCount: 1,
        workingSetsCount: 1,
        loadVolumeGrams: 660000,
        loadVolumeKg: 660,
      },
      sets: [
        {
          id: "00000000-0000-4000-8000-000000000013",
          order: 1,
          type: "WARMUP",
          weightInGrams: 40000,
          reps: 12,
          rir: null,
          durationInSeconds: null,
          notes: "Aquecimento controlado.",
          completedAt: "2026-10-06T18:40:00.000Z",
        },
        {
          id: "00000000-0000-4000-8000-000000000014",
          order: 2,
          type: "WORKING",
          weightInGrams: 82500,
          reps: 8,
          rir: 2,
          durationInSeconds: null,
          notes: null,
          completedAt: "2026-10-06T18:45:00.000Z",
        },
      ],
    },
    {
      id: "00000000-0000-4000-8000-000000000015",
      exerciseId: null,
      exerciseNameSnapshot: "Prancha Legada",
      order: 2,
      notes: null,
      planned: {
        warmupSets: null,
        workingSets: null,
        reps: null,
        restTimeInSeconds: null,
      },
      performed: {
        warmupSetsCount: 0,
        workingSetsCount: 1,
        loadVolumeGrams: 0,
        loadVolumeKg: 0,
      },
      sets: [
        {
          id: "00000000-0000-4000-8000-000000000016",
          order: 1,
          type: "WORKING",
          weightInGrams: null,
          reps: null,
          rir: null,
          durationInSeconds: 75,
          notes: "Respiração contínua.",
          completedAt: "2026-10-06T19:20:00.000Z",
        },
      ],
    },
  ],
};

describe("Workout history UI — Task 3.5", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    intersectionCallback = null;
    global.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    } as typeof IntersectionObserver;
  });

  afterEach(cleanup);

  it("renderiza PLANNED e FREE com snapshots, badges, métricas, volume zero e links reais", () => {
    const { unmount } = render(
      <HistorySessionCard session={historyItem("planned-session")} />,
    );

    expect(screen.getByText("Upper A")).toBeDefined();
    expect(screen.getByText("Hipertrofia")).toBeDefined();
    expect(screen.getByText("Planejado")).toBeDefined();
    expect(screen.getByText("6 exercícios")).toBeDefined();
    expect(screen.getByText("17 séries")).toBeDefined();
    expect(screen.getByText("1h 02min")).toBeDefined();
    expect(screen.getByText("8.420 kg")).toBeDefined();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/history/planned-session",
    );
    unmount();

    render(
      <HistorySessionCard
        session={historyItem("free-session", {
          origin: "FREE",
          workoutPlanId: null,
          workoutPlanNameSnapshot: null,
          workoutDayNameSnapshot: null,
          totalLoadVolumeGrams: 0,
          totalLoadVolumeKg: 0,
        })}
      />,
    );
    expect(screen.getByText("Treino avulso")).toBeDefined();
    expect(screen.getByText("Avulso")).toBeDefined();
    expect(screen.getByText("Sem carga registrada")).toBeDefined();
    expect(screen.queryByText("0 kg")).toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/history/free-session",
    );
  });

  it("protege a troca rápida de filtros contra resposta antiga e reseta os itens", async () => {
    const plannedRequest = deferred<any>();
    const freeRequest = deferred<any>();
    vi.mocked(loadWorkoutHistoryPage).mockImplementation(({ origin }) =>
      origin === "PLANNED" ? plannedRequest.promise : freeRequest.promise,
    );

    render(
      <HistoryTimeline
        initialPage={{
          items: [historyItem("all-session")],
          nextCursor: "cursor-all",
          hasMore: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Planejados" }));
    expect(screen.queryByText("Upper A")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Avulsos" }));

    await act(async () => {
      freeRequest.resolve({
        success: true,
        data: {
          items: [
            historyItem("free-fast", {
              origin: "FREE",
              workoutPlanId: null,
              workoutPlanNameSnapshot: null,
              workoutDayNameSnapshot: null,
            }),
          ],
          nextCursor: null,
          hasMore: false,
        },
      });
    });
    expect(screen.getByText("Treino avulso")).toBeDefined();

    await act(async () => {
      plannedRequest.resolve({
        success: true,
        data: {
          items: [
            historyItem("planned-slow", { workoutDayNameSnapshot: "Slow" }),
          ],
          nextCursor: null,
          hasMore: false,
        },
      });
    });
    expect(screen.getByText("Treino avulso")).toBeDefined();
    expect(screen.queryByText("Slow")).toBeNull();
    expect(loadWorkoutHistoryPage).toHaveBeenNthCalledWith(1, {
      origin: "PLANNED",
    });
    expect(loadWorkoutHistoryPage).toHaveBeenNthCalledWith(2, {
      origin: "FREE",
    });
  });

  it("faz infinite scroll, bloqueia cursor duplicado, anexa com dedupe e encerra em hasMore=false", async () => {
    const nextPage = deferred<any>();
    vi.mocked(loadWorkoutHistoryPage).mockReturnValue(nextPage.promise);

    render(
      <HistoryTimeline
        initialPage={{
          items: [historyItem("session-1")],
          nextCursor: "opaque-page-2",
          hasMore: true,
        }}
      />,
    );

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(loadWorkoutHistoryPage).toHaveBeenCalledTimes(1);
    expect(loadWorkoutHistoryPage).toHaveBeenCalledWith({
      cursor: "opaque-page-2",
      origin: undefined,
    });

    await act(async () => {
      nextPage.resolve({
        success: true,
        data: {
          items: [
            historyItem("session-1"),
            historyItem("session-2", { workoutDayNameSnapshot: "Lower B" }),
          ],
          nextCursor: null,
          hasMore: false,
        },
      });
    });

    expect(
      screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href")?.startsWith("/history/")),
    ).toHaveLength(2);
    expect(screen.getByText("Lower B")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Carregar mais" })).toBeNull();
  });

  it("preserva a página atual após erro de load more e repete o mesmo cursor no retry", async () => {
    vi.mocked(loadWorkoutHistoryPage)
      .mockResolvedValueOnce({
        success: false,
        error: "falhou",
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          items: [
            historyItem("session-2", { workoutDayNameSnapshot: "Lower B" }),
          ],
          nextCursor: null,
          hasMore: false,
        },
      });

    render(
      <HistoryTimeline
        initialPage={{
          items: [historyItem("session-1")],
          nextCursor: "retry-cursor",
          hasMore: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    await screen.findByText("Não foi possível carregar mais treinos");
    expect(screen.getByText("Upper A")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await screen.findByText("Lower B");
    expect(loadWorkoutHistoryPage).toHaveBeenNthCalledWith(1, {
      cursor: "retry-cursor",
      origin: undefined,
    });
    expect(loadWorkoutHistoryPage).toHaveBeenNthCalledWith(2, {
      cursor: "retry-cursor",
      origin: undefined,
    });
  });

  it("distingue empty global de empty por filtro", async () => {
    const { unmount } = render(
      <HistoryTimeline
        initialPage={{ items: [], nextCursor: null, hasMore: false }}
      />,
    );
    expect(screen.getByText("Nenhum treino concluído ainda")).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Ir para o início" }),
    ).toBeDefined();
    unmount();

    vi.mocked(loadWorkoutHistoryPage).mockResolvedValue({
      success: true,
      data: { items: [], nextCursor: null, hasMore: false },
    });
    render(
      <HistoryTimeline
        initialPage={{
          items: [historyItem("session-1")],
          nextCursor: null,
          hasMore: false,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Avulsos" }));
    expect(
      await screen.findByText("Nenhum treino avulso encontrado"),
    ).toBeDefined();
    expect(screen.queryByRole("link", { name: "Ir para o início" })).toBeNull();
  });

  it("renderiza detalhe planejado com summary, planned/performed, sets, nulls, duração, notes e legado", () => {
    render(<HistorySessionDetail session={plannedDetail} />);

    expect(screen.getByRole("heading", { name: "Upper A" })).toBeDefined();
    expect(screen.getByText("Hipertrofia")).toBeDefined();
    expect(screen.getAllByText("Planejado")).toHaveLength(2);
    expect(
      screen.getByText("2 aquec. • 3 válidas • 8 reps • 90s descanso"),
    ).toBeDefined();
    expect(screen.getAllByText("Realizado")).toHaveLength(2);
    expect(screen.getByText("Supino Reto Histórico")).toBeDefined();
    expect(screen.getByText("Prancha Legada")).toBeDefined();
    expect(screen.getByText("82,5 kg")).toBeDefined();
    expect(screen.getByText("1min 15s")).toBeDefined();
    expect(screen.getByText("Manter escápulas estáveis.")).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Ver evolução" }).getAttribute("href"),
    ).toBe("/stats/exercises/00000000-0000-4000-8000-000000000012");
    expect(screen.getByText("Aquecimento controlado.")).toBeDefined();
    expect(screen.getByText("Respiração contínua.")).toBeDefined();
    expect(screen.getByText("Aquec.")).toBeDefined();
    expect(screen.getAllByText("Válida")).toHaveLength(2);

    const durationRow = screen.getByText("1min 15s").parentElement!;
    expect(within(durationRow).getAllByText("—").length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("omite Planejado no detalhe FREE quando todos os snapshots planejados são nulos", () => {
    const freeDetail: GetWorkoutHistorySession200 = {
      ...plannedDetail,
      origin: "FREE",
      workoutPlanId: null,
      workoutPlanNameSnapshot: null,
      workoutDayNameSnapshot: null,
      exercises: [plannedDetail.exercises[1]],
    };

    render(<HistorySessionDetail session={freeDetail} />);

    expect(
      screen.getByRole("heading", { name: "Treino avulso" }),
    ).toBeDefined();
    expect(screen.getByText("Avulso")).toBeDefined();
    expect(screen.queryByText("Planejado")).toBeNull();
    expect(screen.getByText("Realizado")).toBeDefined();
  });

  it("não mostra link de evolução para exercício histórico sem exerciseId", () => {
    render(
      <HistorySessionDetail
        session={{
          ...plannedDetail,
          exercises: [plannedDetail.exercises[1]],
        }}
      />,
    );

    expect(screen.queryByRole("link", { name: "Ver evolução" })).toBeNull();
  });

  it("mostra erro inicial e permite retry sem depender do observer", async () => {
    vi.mocked(loadWorkoutHistoryPage).mockResolvedValue({
      success: true,
      data: { items: [], nextCursor: null, hasMore: false },
    });
    render(
      <HistoryTimeline
        initialPage={null}
        initialError="Não foi possível carregar seu histórico."
      />,
    );

    expect(
      screen.getByText("Não foi possível carregar seu histórico."),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() =>
      expect(loadWorkoutHistoryPage).toHaveBeenCalledWith({
        origin: undefined,
      }),
    );
  });
});
