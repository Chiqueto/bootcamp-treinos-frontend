/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { WorkoutCover } from "@/app/_components/workout-cover";
import { WorkoutDayCard } from "@/app/_components/workout-day-card";
import {
  getWorkoutCoverTheme,
  getWorkoutCoverUrl,
} from "@/app/_lib/workout-covers";
import nextConfig from "../next.config";

vi.mock("next/image", () => ({
  default: ({ src, alt, onError, sizes }: React.ComponentProps<"img">) => (
    <img src={src} alt={alt} onError={onError} sizes={sizes} />
  ),
}));

afterEach(cleanup);

describe("Workout cover sources", () => {
  it.each([
    undefined,
    null,
    "",
    "   ",
    "not-a-url",
    "http://images.unsplash.com/photo",
    "https://other.example/photo",
    "https://images.unsplash.com.evil.example/photo",
    "javascript:alert(1)",
    "data:image/svg+xml,bad",
    "//evil.example/photo",
    "/\\evil.example/photo",
    "https://user:secret@images.unsplash.com/photo",
    "https://images.unsplash.com:8080/photo",
    "https://a.b.ufs.sh/photo",
  ])("uses the gradient for unsupported source %s", (source) => {
    expect(getWorkoutCoverUrl(source)).toBeNull();
  });

  it.each([
    "/workout-plan-banner.png",
    "https://images.unsplash.com/photo?auto=format",
    "https://assets.ufs.sh/f/cover.png",
  ])("keeps supported image %s", (source) => {
    expect(getWorkoutCoverUrl(` ${source} `)).toBe(source);
  });

  it("shares the host allowlist with the Next image optimizer", () => {
    expect(nextConfig.images?.remotePatterns).toEqual([
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ]);
  });

  it.each([
    ["Glúteos e Quadríceps", "strength"],
    ["Lower A", "strength"],
    ["Costas / Pull", "pull"],
    ["Bíceps e Ombros", "arms"],
    ["Recuperação", "recovery"],
    ["Upper A", "training"],
  ])("chooses a deterministic visual theme for %s", (name, theme) => {
    expect(getWorkoutCoverTheme(name)).toBe(theme);
  });

  it("respects an explicit rest day", () => {
    expect(getWorkoutCoverTheme("Treino A", true)).toBe("recovery");
  });
});

describe("WorkoutCover", () => {
  it("renders the fallback without any image request when no source exists", () => {
    const { container } = render(<WorkoutCover name="Pernas" />);
    expect(container.querySelector("img")).toBeNull();
    expect(
      container.querySelector('[data-cover-theme="strength"]'),
    ).not.toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("rejects unsupported sources before rendering next/image", () => {
    const { container } = render(
      <WorkoutCover src="https://unknown.example/cover.png" />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-cover-theme]")).not.toBeNull();
  });

  it.each([
    "/workout-plan-banner.png",
    "https://images.unsplash.com/missing",
    "https://assets.ufs.sh/f/missing",
  ])("falls back after an image error for %s", (source) => {
    const { container } = render(<WorkoutCover src={source} name="Upper" />);
    const image = container.querySelector("img")!;
    expect(image.getAttribute("src")).toBe(source);
    expect(image.getAttribute("alt")).toBe("");
    fireEvent.error(image);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-cover-theme]")).not.toBeNull();
  });

  it("tries a new source after the previous one failed", () => {
    const { container, rerender } = render(<WorkoutCover src="/missing.png" />);
    fireEvent.error(container.querySelector("img")!);
    rerender(<WorkoutCover src="/workout-plan-banner.png" />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/workout-plan-banner.png",
    );
  });

  it.each([
    ["plan", "lucide-target"],
    ["cycle", "lucide-layers"],
  ] as const)("gives %s a distinct icon", (variant, iconClass) => {
    const { container } = render(<WorkoutCover variant={variant} />);
    expect(container.querySelector(`.${iconClass}`)).not.toBeNull();
  });

  it("includes the fallback on the server before hydration", () => {
    expect(renderToString(<WorkoutCover name="Pernas" />)).toContain(
      'data-cover-theme="strength"',
    );
  });

  it("keeps the workout name, metrics and link after the cover fails", () => {
    const { container } = render(
      <Link href="/workout-plans/plan/days/day">
        <WorkoutDayCard
          name="Upper A"
          estimatedDurationInSeconds={3600}
          exercisesCount={6}
          coverImageUrl="https://assets.ufs.sh/f/missing.png"
        />
      </Link>,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(
      screen.getByRole("heading", { name: "Upper A" }).className,
    ).toContain("text-white");
    expect(screen.getByText("60min")).toBeDefined();
    expect(screen.getByText("6 exercícios")).toBeDefined();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/workout-plans/plan/days/day",
    );
  });
});
