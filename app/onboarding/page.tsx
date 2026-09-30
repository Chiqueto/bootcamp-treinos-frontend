import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/app/_lib/auth-client";
import { getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { Chat } from "@/app/_components/chat";

export default async function OnboardingPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const trainData = await getUserTrainData();

  if (trainData.status === 200 && trainData.data) {
    redirect("/");
  }

  return <Chat embedded initialMessage="Quero começar a melhorar minha saúde!" />;
}
