import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { getCommercialContext } from "@/app/_lib/api/fetch-generated";
import { SignupForm } from "../_components/signup-form";

export default async function SignupPage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (session.data?.user) {
    const context = await getCommercialContext({ cache: "no-store" });
    if (context.status === 200 && context.data.accountSetupCompletedAt)
      redirect("/");
  }
  return <SignupForm authenticated={Boolean(session.data?.user)} />;
}
