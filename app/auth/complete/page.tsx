import { SignupCompletion } from "../_components/signup-completion";

export default function CompletePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-5 px-5 py-10">
      <h1 className="text-2xl font-semibold">Concluir cadastro</h1>
      <SignupCompletion />
    </main>
  );
}
