import Link from "next/link";
import { SearchX } from "lucide-react";

import { BottomNav } from "@/app/_components/bottom-nav";
import { Button } from "@/components/ui/button";

export default function HistorySessionNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-5 pb-24 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="mt-3 font-heading text-xl font-semibold text-foreground">
        Treino não encontrado
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Não foi possível localizar este registro de treino.
      </p>
      <Button asChild variant="outline" className="mt-5 rounded-full">
        <Link href="/history">Voltar ao histórico</Link>
      </Button>
      <BottomNav />
    </div>
  );
}
