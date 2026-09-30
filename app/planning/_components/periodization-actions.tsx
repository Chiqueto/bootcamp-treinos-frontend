"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleStop,
  LoaderCircle,
  Pause,
  Play,
  SkipForward,
} from "lucide-react";

import {
  activatePeriodizationAction,
  advancePeriodizationAction,
  completePeriodizationAction,
  deactivatePeriodizationAction,
} from "@/app/planning/_actions";
import { Button } from "@/components/ui/button";
import { PlanningConfirmDialog } from "./planning-confirm-dialog";

type PeriodizationStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
type Operation = "activate" | "pause" | "advance" | "complete" | null;

interface PeriodizationActionsProps {
  id: string;
  status: PeriodizationStatus;
  totalBlocks: number;
  currentBlockName?: string;
  nextBlockName?: string;
  isLastBlock?: boolean;
}

export function PeriodizationActions({
  id,
  status,
  totalBlocks,
  currentBlockName,
  nextBlockName,
  isLastBlock = false,
}: PeriodizationActionsProps) {
  const router = useRouter();
  const [operation, setOperation] = useState<Operation>(null);
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | undefined
  >();
  const [isPending, startTransition] = useTransition();

  if (status === "COMPLETED") return null;

  if (status === "DRAFT" && totalBlocks === 0) {
    return (
      <section aria-label="Ações da periodização">
        <Button className="h-11 w-full rounded-full" disabled>
          Adicione uma etapa para ativar
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          A composição de etapas estará disponível na próxima fase.
        </p>
      </section>
    );
  }

  function executeOperation() {
    if (!operation) return;

    startTransition(async () => {
      const result =
        operation === "activate"
          ? await activatePeriodizationAction(id)
          : operation === "pause"
            ? await deactivatePeriodizationAction(id)
            : operation === "advance"
              ? await advancePeriodizationAction(id)
              : await completePeriodizationAction(id);

      if (!result.success) {
        setFeedback({ kind: "error", message: result.error });
        setOperation(null);
        return;
      }

      const message =
        operation === "activate"
          ? status === "PAUSED"
            ? "Periodização retomada com sucesso."
            : "Periodização ativada com sucesso."
          : operation === "pause"
            ? "Periodização pausada com sucesso."
            : operation === "advance"
              ? result.data.status === "COMPLETED"
                ? "Última etapa concluída. Periodização finalizada."
                : "Etapa concluída e próxima etapa ativada."
              : "Periodização encerrada com sucesso.";

      setFeedback({ kind: "success", message });
      setOperation(null);
      router.refresh();
    });
  }

  const advanceDescription = isLastBlock ? (
    "Concluir última etapa e finalizar periodização?"
  ) : (
    <>
      Concluir <strong>&quot;{currentBlockName ?? "etapa atual"}&quot;</strong> e
      avançar para <strong>&quot;{nextBlockName ?? "próxima etapa"}&quot;</strong>?
    </>
  );

  return (
    <section
      aria-label="Ações da periodização"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
    >
      {status === "DRAFT" && (
        <Button
          className="h-11 w-full rounded-full"
          disabled={isPending}
          onClick={() => setOperation("activate")}
        >
          {isPending ? <LoaderCircle className="animate-spin" /> : <Play />}
          Ativar periodização
        </Button>
      )}

      {status === "PAUSED" && (
        <Button
          className="h-11 w-full rounded-full"
          disabled={isPending}
          onClick={() => setOperation("activate")}
        >
          {isPending ? <LoaderCircle className="animate-spin" /> : <Play />}
          Retomar periodização
        </Button>
      )}

      {status === "ACTIVE" && (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-11 rounded-full"
              disabled={isPending}
              onClick={() => setOperation("pause")}
            >
              <Pause />
              Pausar
            </Button>
            <Button
              className="h-11 rounded-full"
              disabled={isPending}
              onClick={() => setOperation("advance")}
            >
              <SkipForward />
              Concluir etapa e avançar
            </Button>
          </div>
          <Button
            variant="ghost"
            className="h-11 w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isPending}
            onClick={() => setOperation("complete")}
          >
            <CircleStop />
            Encerrar periodização
          </Button>
        </>
      )}

      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`flex items-center gap-1.5 text-xs ${
            feedback.kind === "error" ? "text-destructive" : "text-primary"
          }`}
        >
          {feedback.kind === "success" && <CheckCircle2 className="size-3.5" />}
          {feedback.message}
        </p>
      )}

      <PlanningConfirmDialog
        open={operation === "activate"}
        title={
          status === "PAUSED" ? "Retomar periodização" : "Ativar periodização"
        }
        description="Ao ativar esta periodização, seu plano atual poderá ser substituído."
        confirmLabel={status === "PAUSED" ? "Retomar" : "Ativar"}
        pendingLabel={status === "PAUSED" ? "Retomando..." : "Ativando..."}
        isPending={isPending}
        onCancel={() => setOperation(null)}
        onConfirm={executeOperation}
      />

      <PlanningConfirmDialog
        open={operation === "pause"}
        title="Pausar periodização"
        description="O progresso será preservado e você poderá retomar depois."
        confirmLabel="Pausar periodização"
        pendingLabel="Pausando..."
        isPending={isPending}
        onCancel={() => setOperation(null)}
        onConfirm={executeOperation}
      />

      <PlanningConfirmDialog
        open={operation === "advance"}
        title="Concluir etapa"
        description={advanceDescription}
        confirmLabel={
          isLastBlock ? "Concluir e finalizar" : "Concluir e avançar"
        }
        pendingLabel="Avançando..."
        isPending={isPending}
        onCancel={() => setOperation(null)}
        onConfirm={executeOperation}
      />

      <PlanningConfirmDialog
        open={operation === "complete"}
        title="Encerrar esta periodização agora?"
        description={
          <>
            <p>A etapa atual será concluída e as etapas futuras</p>
            <p>permanecerão registradas como não executadas.</p>
          </>
        }
        confirmLabel="Encerrar periodização"
        pendingLabel="Encerrando..."
        destructive
        isPending={isPending}
        onCancel={() => setOperation(null)}
        onConfirm={executeOperation}
      />
    </section>
  );
}
