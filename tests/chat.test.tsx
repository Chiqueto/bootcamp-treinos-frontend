/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { Chat, formatRelativeDate } from "@/app/_components/chat";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock nuqs
const mockSetChatParams = vi.fn();
let mockChatParams = { chat_open: true, chat_initial_message: null as string | null };

vi.mock("nuqs", () => ({
  useQueryStates: () => [mockChatParams, mockSetChatParams],
  parseAsBoolean: { withDefault: () => ({}) },
  parseAsString: {},
}));

// Mock @ai-sdk/react
const mockSendMessage = vi.fn();
const mockAddToolApprovalResponse = vi.fn();
const mockSetMessages = vi.fn();
let mockMessages: any[] = [];
let mockStatus = "ready";

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: mockMessages,
    sendMessage: mockSendMessage,
    addToolApprovalResponse: mockAddToolApprovalResponse,
    setMessages: mockSetMessages,
    status: mockStatus,
  }),
}));

// Mock streamdown
vi.mock("streamdown", () => ({
  Streamdown: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="streamdown" className={className}>
      {children}
    </div>
  ),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("Chat — Trainvy Planning Coach V1 & Task 2.8 Persistent Chat", () => {
  beforeEach(() => {
    mockChatParams = { chat_open: true, chat_initial_message: null };
    mockMessages = [];
    mockStatus = "ready";
    vi.clearAllMocks();

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/ai/conversations")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ conversations: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("formatRelativeDate", () => {
    it("formata corretamente Hoje, Ontem e datas DD/MM", () => {
      const now = new Date();
      expect(formatRelativeDate(now.toISOString())).toBe("Hoje");

      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(yesterday.toISOString())).toBe("Ontem");

      const oldDate = new Date(2026, 8, 28); // 28/09
      expect(formatRelativeDate(oldDate.toISOString())).toBe("28/09");
    });
  });

  it("exibe branding Coach AI e Acessar Trainvy no modo embedded", () => {
    render(<Chat embedded={true} />);

    expect(screen.getByText("Coach AI")).toBeDefined();
    const trainvyLink = screen.getByRole("link", { name: /Acessar Trainvy/i });
    expect(trainvyLink).toBeDefined();
    expect(trainvyLink.getAttribute("href")).toBe("/");
  });

  it("renderiza as sugestões iniciais atualizadas quando não há mensagens", () => {
    render(<Chat embedded={false} />);

    const suggestion1 = screen.getByRole("button", { name: "Monte um plano de treino para mim" });
    const suggestion2 = screen.getByRole("button", { name: "Monte uma periodização para mim" });
    const suggestion3 = screen.getByRole("button", { name: "Explique meu planejamento atual" });

    expect(suggestion1).toBeDefined();
    expect(suggestion2).toBeDefined();
    expect(suggestion3).toBeDefined();

    fireEvent.click(suggestion1);
    expect(mockSendMessage).toHaveBeenCalledWith({ text: "Monte um plano de treino para mim" });
  });

  it("renderiza a resposta textual do assistente após uso de tool e criação de rascunho", () => {
    mockMessages = [
      {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "Salva esse plano" }],
      },
      {
        id: "msg-2",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Salvei seu plano de treino 'Hipertrofia 4 Dias' como rascunho. Você pode revisá-lo e ativá-lo em [Planejamento](/planning).",
          },
        ],
      },
    ];

    render(<Chat embedded={false} />);

    expect(screen.getByText("Salva esse plano")).toBeDefined();
    const assistantText = screen.getByTestId("streamdown");
    expect(assistantText.textContent).toContain("Salvei seu plano de treino 'Hipertrofia 4 Dias' como rascunho");
    expect(assistantText.textContent).toContain("[Planejamento](/planning)");
  });

  it("renderiza card de aprovação para proposta de plano e dispara addToolApprovalResponse com approved: true", () => {
    mockMessages = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Preparei uma proposta de treino semanal para você revisar.",
          },
          {
            type: "tool-createWorkoutPlanDraft",
            state: "approval-requested",
            input: {
              name: "Upper / Lower 4 Dias",
              workoutDays: [
                { weekDay: "MONDAY", name: "Upper A", isRest: false, exercises: [{ name: "Supino" }] },
                { weekDay: "TUESDAY", name: "Lower A", isRest: false, exercises: [{ name: "Agachamento" }] },
                { weekDay: "WEDNESDAY", name: "Descanso", isRest: true, exercises: [] },
              ],
            },
            approval: {
              id: "appr-workout-1",
            },
          },
        ],
      },
    ];

    render(<Chat embedded={false} />);

    expect(screen.getByText("Plano Proposto")).toBeDefined();
    expect(screen.getByText("Upper / Lower 4 Dias")).toBeDefined();
    expect(screen.getByText("Aprovação necessária")).toBeDefined();

    const approveButton = screen.getByRole("button", { name: "Salvar como rascunho" });
    const rejectButton = screen.getByRole("button", { name: "Continuar ajustando" });
    expect(approveButton).toBeDefined();
    expect(rejectButton).toBeDefined();

    fireEvent.click(approveButton);
    expect(mockAddToolApprovalResponse).toHaveBeenCalledWith({
      id: "appr-workout-1",
      approved: true,
    });
  });

  it("dispara addToolApprovalResponse com approved: false ao clicar em Continuar ajustando", () => {
    mockMessages = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [
          {
            type: "tool-createWorkoutPlanDraft",
            state: "approval-requested",
            input: {
              name: "Upper / Lower 4 Dias",
              workoutDays: [],
            },
            approval: {
              id: "appr-workout-2",
            },
          },
        ],
      },
    ];

    render(<Chat embedded={false} />);

    const rejectButton = screen.getByRole("button", { name: "Continuar ajustando" });
    fireEvent.click(rejectButton);

    expect(mockAddToolApprovalResponse).toHaveBeenCalledWith({
      id: "appr-workout-2",
      approved: false,
      reason: "Continuar ajustando",
    });
  });

  it("Task 2.8: approval-responded exibe 'Proposta aprovada — salvando...' sem afirmar falsamente persistência", () => {
    mockMessages = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [
          {
            type: "tool-createWorkoutPlanDraft",
            state: "approval-responded",
            approval: { id: "appr-1", approved: true },
          },
          {
            type: "tool-createWorkoutPlanDraft",
            state: "approval-responded",
            approval: { id: "appr-2", approved: false },
          },
        ],
      },
    ];

    render(<Chat embedded={false} />);

    // NÃO deve dizer "Salva como rascunho" em approval-responded
    expect(screen.queryByText(/Salva como rascunho/i)).toBeNull();
    // Deve dizer "Proposta aprovada — salvando..."
    expect(screen.getByText(/Proposta aprovada — salvando.../i)).toBeDefined();
    expect(screen.getByText(/Ajustes solicitados — Rascunho não persistido/i)).toBeDefined();
  });

  it("Task 2.8: output-available exibe 'Rascunho salvo' e link para [Ver em Planejamento] quando tem planId", () => {
    mockMessages = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [
          {
            type: "tool-createWorkoutPlanDraft",
            state: "output-available",
            output: {
              status: "SAVED_DRAFT",
              planId: "plan-123",
              name: "Hipertrofia 4x",
            },
          },
        ],
      },
    ];

    render(<Chat embedded={false} />);

    expect(screen.getByText(/Rascunho salvo/i)).toBeDefined();
    const planningLink = screen.getByRole("link", { name: /Ver em Planejamento/i });
    expect(planningLink).toBeDefined();
    expect(planningLink.getAttribute("href")).toBe("/planning");
  });

  it("Task 2.8: output-available exibe link para [Ver periodização] quando tem periodizationId", () => {
    mockMessages = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [
          {
            type: "tool-createPeriodizationDraft",
            state: "output-available",
            output: {
              status: "SAVED_DRAFT",
              periodizationId: "per-999",
              name: "Ciclo Vôlei",
            },
          },
        ],
      },
    ];

    render(<Chat embedded={false} />);

    expect(screen.getByText(/Rascunho salvo/i)).toBeDefined();
    const periodizationLink = screen.getByRole("link", { name: /Ver periodização/i });
    expect(periodizationLink).toBeDefined();
    expect(periodizationLink.getAttribute("href")).toBe("/planning/periodizations/per-999");
  });

  it("Task 2.8: trata estados de erro (output-error) e negação (output-denied)", () => {
    mockMessages = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [
          {
            type: "tool-createWorkoutPlanDraft",
            state: "output-error",
            errorText: "Erro de banco",
          },
          {
            type: "tool-createWorkoutPlanDraft",
            state: "output-denied",
          },
        ],
      },
    ];

    render(<Chat embedded={false} />);

    expect(screen.getByText(/Não foi possível salvar/i)).toBeDefined();
    expect(screen.getByText(/Rascunho não salvo/i)).toBeDefined();
  });

  it("Task 2.8 (#IMPORTANTE): exibe badge dinâmica de Thinking quando isLoading = true", () => {
    mockStatus = "streaming";

    render(<Chat embedded={false} />);

    // Deve exibir pelo menos a primeira frase de thinking do gym
    expect(screen.getByText("(Pensando...)")).toBeDefined();
  });

  it("Task 2.8: abre o drawer de conversas e botão Nova Conversa limpa mensagens", async () => {
    const mockConvs = [
      {
        id: "c-1",
        title: "Periodização para vôlei",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messagesCount: 4,
      },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/ai/conversations")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ conversations: mockConvs }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<Chat embedded={false} />);

    // Clica no botão de conversas
    const menuBtn = screen.getByTitle("Conversas");
    await act(async () => {
      fireEvent.click(menuBtn);
    });

    expect(screen.getByText("Suas conversas")).toBeDefined();
    expect(screen.getAllByText("Periodização para vôlei").length).toBeGreaterThanOrEqual(1);

    // Botão Nova conversa limpa mensagens
    const newConvBtn = screen.getAllByRole("button", { name: /\+ Nova conversa/i })[0];
    fireEvent.click(newConvBtn);

    expect(mockSetMessages).toHaveBeenCalledWith([]);
  });
});
