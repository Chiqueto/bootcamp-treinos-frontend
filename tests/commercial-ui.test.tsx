import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  social: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));
vi.mock("@/app/_lib/auth-client", () => ({
  authClient: { signIn: { social: mocks.social } },
}));
vi.mock("@/app/auth/_actions", () => ({
  beginSignup: vi.fn(),
  loadCoachPlans: vi.fn(),
  finishSignup: vi.fn(),
}));
import { beginSignup, finishSignup, loadCoachPlans } from "@/app/auth/_actions";
import { SignupForm } from "@/app/auth/_components/signup-form";
import { SignupCompletion } from "@/app/auth/_components/signup-completion";
import { SignInWithGoogle } from "@/app/auth/_components/sign-in-with-google";

const plans = [
  {
    code: "COACH",
    name: "Personal",
    description: null,
    currency: "BRL",
    monthlyPriceInCents: 4990,
    entitlements: [{ entitlement: "MANAGE_ATHLETES" as const, limitValue: 5 }],
  },
  {
    code: "COACH_AI",
    name: "Personal AI",
    description: null,
    currency: "BRL",
    monthlyPriceInCents: 8990,
    entitlements: [],
  },
];
beforeEach(() => {
  vi.resetAllMocks();
  mocks.social.mockResolvedValue({});
  vi.mocked(beginSignup).mockResolvedValue({ success: true });
  vi.mocked(loadCoachPlans).mockResolvedValue({ success: true, plans });
});
afterEach(cleanup);

describe("Account signup UI", () => {
  it("existing login uses OAuth without signup intent or implicit signup", async () => {
    render(<SignInWithGoogle />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(mocks.social).toHaveBeenCalledWith(
        expect.objectContaining({
          requestSignUp: false,
          callbackURL: expect.stringContaining("/auth/complete"),
        }),
      ),
    );
    expect(beginSignup).not.toHaveBeenCalled();
  });
  it("athlete defaults to free without loading paid catalogue", async () => {
    render(<SignupForm />);
    expect(screen.getByText("Grátis")).toBeTruthy();
    expect(loadCoachPlans).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Continuar com Google" }),
    );
    await waitFor(() =>
      expect(mocks.social).toHaveBeenCalledWith(
        expect.objectContaining({ requestSignUp: true }),
      ),
    );
    expect(beginSignup).toHaveBeenCalledWith({
      accountType: "ATHLETE",
      planCode: "ATHLETE_FREE",
    });
  });
  it("coach prices come from backend and selected plan is sent without price", async () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: /Sou Personal/ }));
    expect(await screen.findByText(/49,90/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Personal AI/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Continuar com Google" }),
    );
    await waitFor(() =>
      expect(beginSignup).toHaveBeenCalledWith({
        accountType: "COACH",
        planCode: "COACH_AI",
      }),
    );
  });
  it("plan errors support retry", async () => {
    vi.mocked(loadCoachPlans).mockResolvedValueOnce({ success: false });
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: /Sou Personal/ }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Continuar com Google" })
        .hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText(/49,90/)).toBeTruthy();
  });
  it("shows loading plans and blocks submit while fetching", async () => {
    vi.mocked(loadCoachPlans).mockReturnValue(new Promise(() => {}));
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: /Sou Personal/ }));
    expect(screen.getByRole("status").textContent).toContain("Carregando");
    expect(
      screen
        .getByRole("button", { name: "Continuar com Google" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
  it("failed intent never starts OAuth", async () => {
    vi.mocked(beginSignup).mockResolvedValue({ success: false });
    render(<SignupForm />);
    fireEvent.click(
      screen.getByRole("button", { name: "Continuar com Google" }),
    );
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(mocks.social).not.toHaveBeenCalled();
  });
  it("authenticated incomplete user completes without repeating OAuth", async () => {
    render(<SignupForm authenticated />);
    fireEvent.click(screen.getByRole("button", { name: "Concluir cadastro" }));
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/auth/complete"),
    );
    expect(mocks.social).not.toHaveBeenCalled();
  });
  it("completion redirects to onboarding", async () => {
    vi.mocked(finishSignup).mockResolvedValue({
      success: true,
      destination: "/onboarding",
    });
    render(<SignupCompletion />);
    expect(screen.getByRole("status")).toBeTruthy();
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/onboarding"),
    );
  });
  it("expired intent gives a restart link", async () => {
    vi.mocked(finishSignup).mockResolvedValue({
      success: false,
      code: "SIGNUP_INTENT_EXPIRED",
    });
    render(<SignupCompletion />);
    expect((await screen.findByRole("alert")).textContent).toContain("expirou");
    expect(
      screen
        .getByRole("link", { name: "Reiniciar cadastro" })
        .getAttribute("href"),
    ).toBe("/auth/signup");
  });
});
