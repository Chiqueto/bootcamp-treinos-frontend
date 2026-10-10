import { beforeEach, describe, expect, it, vi } from "vitest";

const cookie = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: async () => cookie }));
vi.mock("@/app/_lib/api/fetch-generated", () => ({
  listPublicPlans: vi.fn(),
  createSignupIntent: vi.fn(),
  completeSignup: vi.fn(),
  getCommercialContext: vi.fn(),
}));
import {
  completeSignup,
  createSignupIntent,
  getCommercialContext,
  listPublicPlans,
} from "@/app/_lib/api/fetch-generated";
import { beginSignup, finishSignup, loadCoachPlans } from "@/app/auth/_actions";

const response = (status: number, data: unknown) =>
  ({ status, data, headers: new Headers() }) as never;
beforeEach(() => {
  vi.resetAllMocks();
});
describe("Signup server actions", () => {
  it("loads only coach public plans through generated client", async () => {
    vi.mocked(listPublicPlans).mockResolvedValue(response(200, []));
    expect(await loadCoachPlans()).toEqual({ success: true, plans: [] });
    expect(listPublicPlans).toHaveBeenCalledWith(
      { audience: "COACH" },
      { cache: "no-store" },
    );
  });
  it("handles plan API failures", async () => {
    vi.mocked(listPublicPlans).mockRejectedValue(new Error("offline"));
    expect(await loadCoachPlans()).toEqual({ success: false });
  });
  it("stores opaque intent in HttpOnly cookie and never returns it to JS", async () => {
    vi.mocked(createSignupIntent).mockResolvedValue(
      response(201, {
        token: "secret-token",
        expiresAt: "2026-10-07T12:00:00Z",
      }),
    );
    const result = await beginSignup({
      accountType: "COACH",
      planCode: "COACH",
    });
    expect(createSignupIntent).toHaveBeenCalledWith({
      accountType: "COACH",
      planCode: "COACH",
    });
    expect(cookie.set).toHaveBeenCalledWith(
      "trainvy-signup-intent",
      "secret-token",
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
    expect(result).toEqual({ success: true });
    expect(JSON.stringify(result)).not.toContain("secret-token");
  });
  it("does not set cookie when intent is rejected", async () => {
    vi.mocked(createSignupIntent).mockResolvedValue(
      response(400, { code: "INVALID_SIGNUP_PLAN" }),
    );
    expect(
      await beginSignup({ accountType: "ATHLETE", planCode: "COACH" }),
    ).toEqual({ success: false });
    expect(cookie.set).not.toHaveBeenCalled();
  });
  it("existing login bypasses completion and discards stale intent", async () => {
    vi.mocked(getCommercialContext).mockResolvedValue(
      response(200, { accountSetupCompletedAt: "2026-01-01T00:00:00Z" }),
    );
    expect(await finishSignup()).toEqual({ success: true, destination: "/" });
    expect(completeSignup).not.toHaveBeenCalled();
    expect(cookie.delete).toHaveBeenCalledWith("trainvy-signup-intent");
  });
  it.each([
    ["ATHLETE", "/onboarding"],
    ["COACH", "/auth/welcome"],
  ])(
    "finishes %s with only the cookie token",
    async (accountType, destination) => {
      vi.mocked(getCommercialContext).mockResolvedValue(
        response(200, { accountSetupCompletedAt: null }),
      );
      cookie.get.mockReturnValue({ value: "opaque" });
      vi.mocked(completeSignup).mockResolvedValue(
        response(200, { accountType }),
      );
      expect(await finishSignup()).toEqual({ success: true, destination });
      expect(completeSignup).toHaveBeenCalledWith({ token: "opaque" });
    },
  );
  it("missing intent never silently initializes athlete", async () => {
    vi.mocked(getCommercialContext).mockResolvedValue(
      response(200, { accountSetupCompletedAt: null }),
    );
    expect(await finishSignup()).toEqual({
      success: false,
      code: "SIGNUP_INTENT_REQUIRED",
    });
    expect(completeSignup).not.toHaveBeenCalled();
  });
  it("expired intent produces structured retryable error", async () => {
    vi.mocked(getCommercialContext).mockResolvedValue(
      response(200, { accountSetupCompletedAt: null }),
    );
    cookie.get.mockReturnValue({ value: "opaque" });
    vi.mocked(completeSignup).mockResolvedValue(
      response(400, { code: "SIGNUP_INTENT_EXPIRED" }),
    );
    expect(await finishSignup()).toEqual({
      success: false,
      code: "SIGNUP_INTENT_EXPIRED",
    });
  });
  it("concurrent already initialized response is safe", async () => {
    vi.mocked(getCommercialContext).mockResolvedValue(
      response(200, { accountSetupCompletedAt: null }),
    );
    cookie.get.mockReturnValue({ value: "opaque" });
    vi.mocked(completeSignup).mockResolvedValue(
      response(409, { code: "ACCOUNT_ALREADY_INITIALIZED" }),
    );
    expect(await finishSignup()).toEqual({ success: true, destination: "/" });
  });
  it("requires an authenticated session", async () => {
    vi.mocked(getCommercialContext).mockResolvedValue(response(401, {}));
    expect(await finishSignup()).toEqual({
      success: false,
      code: "UNAUTHORIZED",
    });
    expect(completeSignup).not.toHaveBeenCalled();
  });
});
