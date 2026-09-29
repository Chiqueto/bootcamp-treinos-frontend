"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { authClient } from "@/app/_lib/auth-client";
import { Button } from "@/components/ui/button";

export const SignInWithGoogle = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const callbackOrigin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(
              /\/+$/,
              ""
            );

      const callbackURL = `${callbackOrigin}/`;

      console.log("[AUTH FRONTEND] Iniciando login com Google:", {
        callbackURL,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
        href: typeof window !== "undefined" ? window.location.href : undefined,
      });

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      console.log("[AUTH FRONTEND] Resposta de authClient.signIn.social:", result);

      if (result?.error) {
        console.error("[AUTH FRONTEND] Erro retornado pelo signIn.social:", result.error);
        setErrorMessage(
          result.error.message ||
            `Erro (${result.error.status || "desconhecido"}) ao conectar com Google`
        );
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[AUTH FRONTEND] Exceção inesperada no login:", err);
      setErrorMessage("Erro ao iniciar login. Verifique o console do navegador.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="h-[38px] cursor-pointer rounded-full bg-white px-6 text-black hover:bg-white/90 disabled:opacity-75"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-black" />
            Conectando com Google...
          </>
        ) : (
          <>
            <Image
              src="/google-icon.svg"
              alt=""
              width={16}
              height={16}
              className="shrink-0"
            />
            Fazer login com Google
          </>
        )}
      </Button>

      {errorMessage && (
        <p className="max-w-xs text-center text-xs font-medium text-red-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
