"use client";

import { useState } from "react";
import { Check, Flame, Heart, Trophy, Zap, ShieldAlert } from "lucide-react";

const FEELINGS = [
  { id: "great", label: "Ótimo", icon: Trophy, desc: "Rendimento no topo" },
  { id: "energized", label: "Energizado", icon: Zap, desc: "Força e foco" },
  { id: "intense", label: "Intenso", icon: Flame, desc: "No limite muscular" },
  { id: "fatigued", label: "Cansado", icon: ShieldAlert, desc: "Alta fadiga" },
];

export function SummaryFeedbackWidget() {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedFeeling(id);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-primary" />
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Como você se sentiu hoje?
          </h3>
        </div>
        {submitted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-heading text-[11px] font-semibold text-emerald-500">
            <Check className="size-3" />
            Salvo
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Registre sua sensação pós-treino para calibrar suas próximas sessões.
      </p>

      <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4">
        {FEELINGS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedFeeling === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40"
              }`}
            >
              <div
                className={`flex size-8 items-center justify-center rounded-full ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span className="font-heading text-xs font-semibold text-foreground">
                {item.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 rounded-xl border border-dashed border-border/80 bg-muted/15 p-3 text-center">
        <p className="font-heading text-[11px] font-medium text-muted-foreground">
          ✨ Em breve nesta tela: Compartilhar no Instagram Stories, análise de recuperação e comparação de recordes pessoais (PRs).
        </p>
      </div>
    </div>
  );
}
