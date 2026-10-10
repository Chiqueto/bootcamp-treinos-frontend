import type { GetAdminUser200Subscription } from "@/app/_lib/api/fetch-generated";
import { adminDate } from "../_lib/presentation";
export function SubscriptionStatus({ value }: { value: GetAdminUser200Subscription }) {
  if (!value) return <p>Sem assinatura</p>;
  return <div className="space-y-1 text-sm"><p>{value.status} · {value.billingProvider}</p>
    <p className={value.accessActive ? "text-primary" : "text-muted-foreground"}>Acesso {value.accessActive ? "ativo" : "inativo"}</p>
    {value.status === "TRIALING" && <p>{value.trialExpired ? "Trial expirado" : "Trial até"}: {adminDate(value.trialEndsAt)}</p>}
  </div>;
}
