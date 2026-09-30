import { Suspense } from "react";
import Link from "next/link";
import {
  House,
  CalendarDays,
  ChartNoAxesColumn,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatOpenButton } from "@/app/_components/chat-open-button";

interface BottomNavProps {
  activePage?: "home" | "planning" | "calendar" | "stats" | "profile";
}

export function BottomNav({ activePage = "home" }: BottomNavProps) {
  const isPlanningActive =
    activePage === "planning" || activePage === "calendar";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-6 rounded-t-[20px] border border-border bg-background px-6 py-4">
      <Link href="/" className="p-3" aria-label="Início">
        <House
          className={cn(
            "size-6",
            activePage === "home" ? "text-foreground" : "text-muted-foreground"
          )}
        />
      </Link>
      <Link href="/planning" className="p-3" aria-label="Planejamento">
        <CalendarDays
          className={cn(
            "size-6",
            isPlanningActive ? "text-foreground" : "text-muted-foreground"
          )}
        />
      </Link>
      <Suspense fallback={<div className="size-11" />}>
        <ChatOpenButton />
      </Suspense>
      <Link href="/stats" className="p-3" aria-label="Estatísticas">
        <ChartNoAxesColumn
          className={cn(
            "size-6",
            activePage === "stats"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        />
      </Link>
      <Link href="/profile" className="p-3" aria-label="Perfil">
        <UserRound
          className={cn(
            "size-6",
            activePage === "profile"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        />
      </Link>
    </nav>
  );
}

