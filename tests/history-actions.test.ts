import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/_lib/api/fetch-generated", () => ({
  listWorkoutHistory: vi.fn(),
}));

import { listWorkoutHistory } from "@/app/_lib/api/fetch-generated";
import { loadWorkoutHistoryPage } from "@/app/history/_actions";

describe("History pagination server action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("repassa somente cursor opaco e origin para o client Orval", async () => {
    vi.mocked(listWorkoutHistory).mockResolvedValue({
      status: 200,
      data: { items: [], nextCursor: null, hasMore: false },
      headers: new Headers(),
    });

    const result = await loadWorkoutHistoryPage({
      cursor: "opaque-cursor",
      origin: "PLANNED",
    });

    expect(result.success).toBe(true);
    expect(listWorkoutHistory).toHaveBeenCalledWith({
      cursor: "opaque-cursor",
      origin: "PLANNED",
    });
  });

  it("não envia filtros vazios e trata falha sem expor detalhes", async () => {
    vi.mocked(listWorkoutHistory)
      .mockResolvedValueOnce({
        status: 200,
        data: { items: [], nextCursor: null, hasMore: false },
        headers: new Headers(),
      })
      .mockRejectedValueOnce(new Error("network"));

    await expect(loadWorkoutHistoryPage({})).resolves.toMatchObject({
      success: true,
    });
    expect(listWorkoutHistory).toHaveBeenNthCalledWith(1, {});

    await expect(loadWorkoutHistoryPage({})).resolves.toEqual({
      success: false,
      error: "Não foi possível carregar seu histórico.",
    });
  });
});
