import { describe, expect, it } from "vitest";

import {
  formatDuration,
  formatHistoryDate,
  formatSetDuration,
  formatWeightInGrams,
  formatWeightKg,
  getSetTypeLabel,
} from "@/app/history/_lib/history-formatters";

describe("History formatters", () => {
  it("preserva decimais e usa formatação pt-BR para pesos", () => {
    expect(formatWeightInGrams(80000)).toBe("80 kg");
    expect(formatWeightInGrams(82500)).toBe("82,5 kg");
    expect(formatWeightKg(8420)).toBe("8.420 kg");
  });

  it("formata durações de sessão e de série", () => {
    expect(formatDuration(3900)).toBe("1h 05min");
    expect(formatSetDuration(30)).toBe("30s");
    expect(formatSetDuration(75)).toBe("1min 15s");
  });

  it("formata datas com timezone explícito e independente da máquina", () => {
    expect(
      formatHistoryDate("2026-10-06T19:32:00.000Z", { timeZone: "UTC" }),
    ).toBe("06 out • 19:32");
    expect(
      formatHistoryDate("2026-10-06T19:32:00.000Z", {
        timeZone: "UTC",
        long: true,
      }),
    ).toBe("06 de outubro • 19:32");
  });

  it("centraliza labels de tipos de série", () => {
    expect(getSetTypeLabel("WARMUP")).toBe("Aquec.");
    expect(getSetTypeLabel("WORKING")).toBe("Válida");
  });
});
