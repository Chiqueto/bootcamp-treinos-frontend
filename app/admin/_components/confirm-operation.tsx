"use client";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
export function ConfirmOperation({ open, title, description, busy, onCancel, onConfirm }: { open: boolean; title: string; description: string; busy: boolean; onCancel:()=>void; onConfirm:()=>void }) {
  return <Dialog.Root open={open} onOpenChange={value=>{if(!value&&!busy)onCancel();}}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/60"/><Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border bg-background p-5 shadow-xl">
    <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title><Dialog.Description className="text-sm text-muted-foreground">{description}</Dialog.Description>
    <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={onCancel}>Voltar</Button><Button disabled={busy} onClick={onConfirm}>{busy?"Salvando...":"Confirmar"}</Button></div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
