"use client";

import { useState } from "react";
import { Plus, Dumbbell, CalendarRange, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlanningCreateMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<string | null>(null);

  return (
    <>
      <div className="relative">
        <Button
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-1.5 rounded-full font-heading text-xs font-semibold shadow-sm"
        >
          <Plus className="size-3.5" />
          <span>Novo</span>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-border bg-popover p-1.5 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setInfoModal("Criação de novos planos de treino estará disponível na Fase 2 / Task 2.5B.");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-heading text-xs font-medium text-foreground transition hover:bg-accent"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Dumbbell className="size-4" />
                </div>
                <div>
                  <p className="font-semibold leading-tight">Novo plano</p>
                  <p className="text-[10px] text-muted-foreground">Plano avulso ou base</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setInfoModal("Criação e composição de periodizações estará disponível na Fase 2 / Task 2.5B.");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-heading text-xs font-medium text-foreground transition hover:bg-accent"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarRange className="size-4" />
                </div>
                <div>
                  <p className="font-semibold leading-tight">Nova periodização</p>
                  <p className="text-[10px] text-muted-foreground">Ciclos e macrociclos</p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-xs">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Info className="size-5" />
                <h3 className="font-heading text-sm font-semibold">Em breve</h3>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {infoModal}
            </p>
            <Button
              size="sm"
              variant="default"
              onClick={() => setInfoModal(null)}
              className="w-full rounded-full font-heading text-xs font-semibold"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
