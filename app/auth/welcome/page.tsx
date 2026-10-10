import Link from "next/link";
import { redirect } from "next/navigation";
import { getCommercialContext } from "@/app/_lib/api/fetch-generated";

export default async function WelcomePage() {
  const result = await getCommercialContext({ cache: "no-store" });
  if (result.status === 401) redirect("/auth");
  if (result.status !== 200)
    throw new Error("Não foi possível carregar sua conta.");
  if (!result.data.accountSetupCompletedAt) redirect("/auth/complete");
  if (result.data.accountType !== "COACH") redirect("/");
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-5 px-5 py-10">
      <h1 className="text-2xl font-semibold">Sua conta Personal foi criada</h1>
      <p>Plano escolhido: {result.data.plan?.name}.</p>
      {result.data.subscription?.status === "PENDING" && (
        <p>
          Sua assinatura está pendente de liberação. Nenhuma cobrança foi
          realizada.
        </p>
      )}
      <p className="text-muted-foreground">
        A gestão de alunos estará disponível em uma próxima etapa. Enquanto
        isso, você pode usar o Trainvy para seus próprios treinos.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-5 py-3 text-center text-primary-foreground"
      >
        Ir para meus treinos
      </Link>
    </main>
  );
}
