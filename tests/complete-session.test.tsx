import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Orval generated API
vi.mock("@/app/_lib/api/fetch-generated", () => ({
  completeWorkoutSession: vi.fn(),
  createWorkoutSet: vi.fn(),
  updateWorkoutSet: vi.fn(),
  deleteWorkoutSet: vi.fn(),
  getWorkoutSession: vi.fn(),
  getActiveWorkoutSession: vi.fn(),
}));

import * as api from "@/app/_lib/api/fetch-generated";
import {
  completeWorkoutSessionAction,
} from "@/app/workout-sessions/[sessionId]/_actions";
import { WorkoutSessionTracker } from "@/app/workout-sessions/[sessionId]/_components/workout-session-tracker";

describe("Task 1.7 — Finalização Segura da WorkoutSession", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const baseSession: api.GetWorkoutSession200 = {
    id: "session-123",
    workoutDayId: "day-456",
    startedAt: "2026-09-29T10:00:00.000Z",
    completedAt: null,
    sessionExercises: [
      {
        id: "ex-1",
        exerciseNameSnapshot: "Supino Reto",
        order: 1,
        plannedSets: 3,
        plannedReps: 10,
        plannedRestTimeInSeconds: 90,
        notes: null,
        sets: [
          {
            id: "set-1",
            order: 1,
            type: "WORKING",
            weightInGrams: 40000,
            reps: 10,
            rir: 2,
            durationInSeconds: null,
            notes: null,
            completedAt: "2026-09-29T10:15:00.000Z",
          },
        ],
      },
    ],
  };

  describe("1. Server Action: completeWorkoutSessionAction", () => {
    it("conclui sessão com sucesso (200) e invalida cache das rotas", async () => {
      vi.mocked(api.completeWorkoutSession).mockResolvedValueOnce({
        status: 200,
        data: {
          id: "session-123",
          workoutDayId: "day-456",
          startedAt: "2026-09-29T10:00:00.000Z",
          completedAt: "2026-09-29T11:00:00.000Z",
        },
        headers: new Headers(),
      });

      const res = await completeWorkoutSessionAction("session-123");

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.id).toBe("session-123");
        expect(res.data.completedAt).toBe("2026-09-29T11:00:00.000Z");
      }
    });

    it("retorna erro amigável se a API rejeitar (ex: 400 com séries pendentes)", async () => {
      vi.mocked(api.completeWorkoutSession).mockResolvedValueOnce({
        status: 400,
        data: {
          error:
            "Existem 1 série(s) pendente(s) nesta sessão. Conclua ou remova todas as séries antes de finalizar o treino.",
          code: "PENDING_WORKOUT_SETS",
        },
        headers: new Headers(),
      });

      const res = await completeWorkoutSessionAction("session-123");

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("Existem 1 série(s) pendente(s)");
      }
    });
  });

  describe("2. UI e Fluxo de Finalização no WorkoutSessionTracker", () => {
    it("botão 'Finalizar treino' aparece em sessão ativa (completedAt === null)", () => {
      render(<WorkoutSessionTracker session={baseSession} />);

      const finishButton = screen.getByRole("button", {
        name: /finalizar treino/i,
      });
      expect(finishButton).toBeDefined();
      expect(screen.getByText("Em Andamento")).toBeDefined();
    });

    it("sessão concluída NÃO mostra botão de finalizar treino e exibe estado read-only", () => {
      const completedSession: api.GetWorkoutSession200 = {
        ...baseSession,
        completedAt: "2026-09-29T11:00:00.000Z",
      };

      render(<WorkoutSessionTracker session={completedSession} />);

      expect(
        screen.queryByRole("button", { name: /finalizar treino/i }),
      ).toBeNull();
      expect(screen.getByText("Treino Concluído")).toBeDefined();
      expect(
        screen.getByText(/esta sessão foi finalizada e os registros estão em modo somente leitura/i),
      ).toBeDefined();
    });

    it("confirmação funciona: abre modal com mensagem não-alarmista e botão cancelar fecha", () => {
      render(<WorkoutSessionTracker session={baseSession} />);

      const finishBtn = screen.getByRole("button", { name: /finalizar treino/i });
      fireEvent.click(finishBtn);

      // Modal de confirmação deve aparecer
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(
        screen.getByRole("heading", { name: /finalizar treino\?/i }),
      ).toBeDefined();
      expect(
        screen.getByText(/depois disso, esta sessão ficará somente para leitura/i),
      ).toBeDefined();

      // Clicar em Cancelar deve fechar o modal
      const cancelBtn = screen.getByRole("button", { name: /cancelar/i });
      fireEvent.click(cancelBtn);

      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("conclusão com sucesso fecha modal e atualiza a tela para read-only", async () => {
      vi.mocked(api.completeWorkoutSession).mockResolvedValueOnce({
        status: 200,
        data: {
          id: "session-123",
          workoutDayId: "day-456",
          startedAt: "2026-09-29T10:00:00.000Z",
          completedAt: "2026-09-29T11:00:00.000Z",
        },
        headers: new Headers(),
      });

      render(<WorkoutSessionTracker session={baseSession} />);

      // Abre modal
      fireEvent.click(screen.getByRole("button", { name: /finalizar treino/i }));

      // Clica no botão de confirmar dentro do modal
      const modal = screen.getByRole("dialog");
      const confirmBtn = within(modal).getByRole("button", {
        name: /^finalizar treino$/i,
      });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(screen.getByText("Treino Concluído")).toBeDefined();
      });

      // Botão finalizar deve ter desaparecido
      expect(
        screen.queryByRole("button", { name: /finalizar treino/i }),
      ).toBeNull();
    });

    it("erro de séries pendentes é exibido no banner e não conclui a sessão", async () => {
      vi.mocked(api.completeWorkoutSession).mockResolvedValueOnce({
        status: 400,
        data: {
          error:
            "Existem 1 série(s) pendente(s) nesta sessão. Conclua ou remova todas as séries antes de finalizar o treino.",
          code: "PENDING_WORKOUT_SETS",
        },
        headers: new Headers(),
      });

      render(<WorkoutSessionTracker session={baseSession} />);

      // Abre modal e confirma
      fireEvent.click(screen.getByRole("button", { name: /finalizar treino/i }));
      const modal = screen.getByRole("dialog");
      const confirmBtn = within(modal).getByRole("button", {
        name: /^finalizar treino$/i,
      });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
        expect(
          screen.getByText(/existem 1 série\(s\) pendente\(s\)/i),
        ).toBeDefined();
      });

      // Sessão continua ativa
      expect(screen.getByText("Em Andamento")).toBeDefined();
    });

    it("falha da API não perde dados digitados na tela", async () => {
      vi.mocked(api.completeWorkoutSession).mockResolvedValueOnce({
        status: 500,
        data: {
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        },
        headers: new Headers(),
      });

      render(<WorkoutSessionTracker session={baseSession} />);

      fireEvent.click(screen.getByRole("button", { name: /finalizar treino/i }));
      const modal = screen.getByRole("dialog");
      const confirmBtn = within(modal).getByRole("button", {
        name: /^finalizar treino$/i,
      });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
      });

      // Dados do exercício e série continuam presentes
      expect(screen.getByText("Supino Reto")).toBeDefined();
      expect(screen.getByDisplayValue("40")).toBeDefined();
    });

    it("draft pendente: desfoca elemento ativo ao abrir modal de finalização", () => {
      render(<WorkoutSessionTracker session={baseSession} />);

      const repsInput = screen.getByDisplayValue("10");
      repsInput.focus();
      expect(document.activeElement).toBe(repsInput);

      // Clica em finalizar treino
      const finishBtn = screen.getByRole("button", { name: /finalizar treino/i });
      fireEvent.click(finishBtn);

      // O elemento ativo não deve mais ser o input (blur foi acionado)
      expect(document.activeElement).not.toBe(repsInput);
    });

    it("botão fica bloqueado com 'Salvando alterações...' durante mutation de série", async () => {
      // Cria uma promise pendente para simular request em andamento
      let resolveUpdate: (value: api.updateWorkoutSetResponse) => void = () => {};
      const pendingPromise = new Promise<api.updateWorkoutSetResponse>(
        (resolve) => {
          resolveUpdate = resolve;
        },
      );

      vi.mocked(api.updateWorkoutSet).mockReturnValueOnce(pendingPromise);

      render(<WorkoutSessionTracker session={baseSession} />);

      const repsInput = screen.getByDisplayValue("10");
      fireEvent.change(repsInput, { target: { value: "12" } });
      fireEvent.blur(repsInput);

      // Botão Finalizar treino deve estar desabilitado mostrando indicador de salvamento
      await waitFor(() => {
        const disabledBtn = screen.getByRole("button", {
          name: /salvando alterações\.\.\./i,
        });
        expect(disabledBtn).toHaveProperty("disabled", true);
      });

      // Conclui a mutação
      resolveUpdate({
        status: 200,
        data: {
          id: "set-1",
          sessionExerciseId: "ex-1",
          order: 1,
          type: "WORKING",
          weightInGrams: 40000,
          reps: 12,
          rir: 2,
          durationInSeconds: null,
          notes: null,
          completedAt: "2026-09-29T10:15:00.000Z",
        },
        headers: new Headers(),
      });

      // Botão volta a ficar habilitado como Finalizar treino
      await waitFor(() => {
        const finishBtn = screen.getByRole("button", {
          name: /^finalizar treino$/i,
        });
        expect(finishBtn).toHaveProperty("disabled", false);
      });
    });
  });
});
