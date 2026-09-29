"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.push("/")}
      className="text-foreground hover:bg-muted"
    >
      <ChevronLeft className="size-6 text-foreground" />
      <span className="sr-only">Voltar</span>
    </Button>
  );
}
