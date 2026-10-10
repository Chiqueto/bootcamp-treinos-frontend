"use client";
import { Button } from "@/components/ui/button";
export default function AdminErrorPage({ reset }: { reset: () => void }) {
  return <section role="alert" className="space-y-4"><h1 className="text-xl font-semibold">Não foi possível carregar a administração.</h1><Button onClick={reset}>Tentar novamente</Button></section>;
}
