/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { Chat } from "@/app/_components/chat";

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
let mockMessages: any[] = [];
let mockStatus = "ready";

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: mockMessages,
    sendMessage: mockSendMessage,
    addToolApprovalResponse: mockAddToolApprovalResponse,
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

describe("Chat — Trainvy Planning Coach V1 & Approval Hardening", () => {
  beforeEach(() => {
    mockChatParams = { chat_open: true, chat_initial_message: null };
    mockMessages = [];
    mockStatus = "ready";
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
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

  it("renderiza feedback de aprovação respondida (aprovada vs rejeitada)", () => {
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

    expect(screen.getByText(/Proposta aprovada — Salva como rascunho/i)).toBeDefined();
    expect(screen.getByText(/Ajustes solicitados — Rascunho não persistido/i)).toBeDefined();
  });
});
