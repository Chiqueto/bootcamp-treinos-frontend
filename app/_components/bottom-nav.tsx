"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  CalendarRange,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatOpenButton } from "@/app/_components/chat-open-button";

export interface BottomNavProps {
  activePage?: "home" | "planning" | "calendar" | "stats" | "evolution" | "profile";
}

export function BottomNav({ activePage }: BottomNavProps) {
  const pathname = usePathname();

  // Mapeamento esperado e retrocompatibilidade com prop
  const isPlanningActive = activePage
    ? activePage === "planning" || activePage === "calendar"
    : Boolean(
        pathname &&
          (pathname === "/planning" ||
            pathname.startsWith("/planning/") ||
            pathname === "/workout-plans" ||
            pathname.startsWith("/workout-plans/"))
      );

  const isEvolutionActive = activePage
    ? activePage === "stats" || activePage === "evolution"
    : Boolean(
        pathname &&
          (pathname === "/stats" ||
            pathname.startsWith("/stats/") ||
            pathname === "/history" ||
            pathname.startsWith("/history/"))
      );

  const isProfileActive = activePage
    ? activePage === "profile"
    : Boolean(
        pathname &&
          (pathname === "/profile" || pathname.startsWith("/profile/"))
      );

  const isHomeActive = activePage
    ? activePage === "home"
    : Boolean(
        pathname === "/" ||
          (!isPlanningActive && !isEvolutionActive && !isProfileActive)
      );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] border-t border-border bg-background/95 px-3 pt-2 shadow-lg backdrop-blur-md"
      style={{
        paddingBottom: "max(0.75rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))",
      }}
      aria-label="Navegação inferior"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end justify-items-center">
        {/* 1. Início */}
        <Link
          href="/"
          className={cn(
            "group relative flex w-full flex-1 flex-col items-center justify-center rounded-xl px-1 py-1.5 transition-all duration-150",
            isHomeActive
              ? "bg-primary/10 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground"
          )}
          aria-label="Início"
        >
          <House
            className={cn(
              "size-5 transition-transform duration-150 group-active:scale-90",
              isHomeActive
                ? "text-primary text-foreground"
                : "text-muted-foreground"
            )}
          />
          <span className="mt-0.5 font-heading text-[11px] leading-tight tracking-tight">
            Início
          </span>
          {isHomeActive && (
            <span className="mt-0.5 h-0.5 w-4 rounded-full bg-primary" />
          )}
        </Link>

        {/* 2. Planejar */}
        <Link
          href="/planning"
          className={cn(
            "group relative flex w-full flex-1 flex-col items-center justify-center rounded-xl px-1 py-1.5 transition-all duration-150",
            isPlanningActive
              ? "bg-primary/10 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground"
          )}
          aria-label="Planejar (Planejamento)"
        >
          <CalendarRange
            className={cn(
              "size-5 transition-transform duration-150 group-active:scale-90",
              isPlanningActive
                ? "text-primary text-foreground"
                : "text-muted-foreground"
            )}
          />
          <span className="mt-0.5 font-heading text-[11px] leading-tight tracking-tight">
            Planejar
          </span>
          {isPlanningActive && (
            <span className="mt-0.5 h-0.5 w-4 rounded-full bg-primary" />
          )}
        </Link>

        {/* 3. Coach */}
        <Suspense
          fallback={
            <div className="flex w-full flex-1 flex-col items-center justify-center -mt-3.5">
              <div className="size-11 rounded-full bg-primary/80" />
              <span className="mt-1 font-heading text-[11px] text-muted-foreground">Coach</span>
            </div>
          }
        >
          <ChatOpenButton />
        </Suspense>

        {/* 4. Evolução */}
        <Link
          href="/stats"
          className={cn(
            "group relative flex w-full flex-1 flex-col items-center justify-center rounded-xl px-1 py-1.5 transition-all duration-150",
            isEvolutionActive
              ? "bg-primary/10 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground"
          )}
          aria-label="Evolução"
        >
          <TrendingUp
            className={cn(
              "size-5 transition-transform duration-150 group-active:scale-90",
              isEvolutionActive
                ? "text-primary text-foreground"
                : "text-muted-foreground"
            )}
          />
          <span className="mt-0.5 font-heading text-[11px] leading-tight tracking-tight">
            Evolução
          </span>
          {isEvolutionActive && (
            <span className="mt-0.5 h-0.5 w-4 rounded-full bg-primary" />
          )}
        </Link>

        {/* 5. Perfil */}
        <Link
          href="/profile"
          className={cn(
            "group relative flex w-full flex-1 flex-col items-center justify-center rounded-xl px-1 py-1.5 transition-all duration-150",
            isProfileActive
              ? "bg-primary/10 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground"
          )}
          aria-label="Perfil"
        >
          <UserRound
            className={cn(
              "size-5 transition-transform duration-150 group-active:scale-90",
              isProfileActive
                ? "text-primary text-foreground"
                : "text-muted-foreground"
            )}
          />
          <span className="mt-0.5 font-heading text-[11px] leading-tight tracking-tight">
            Perfil
          </span>
          {isProfileActive && (
            <span className="mt-0.5 h-0.5 w-4 rounded-full bg-primary" />
          )}
        </Link>
      </div>
    </nav>
  );
}
