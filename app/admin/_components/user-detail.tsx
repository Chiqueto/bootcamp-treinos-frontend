"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GetAdminUser200, ListAdminPlans200Item } from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";
import { activateSubscription, cancelSubscription, changeSubscriptionPlan, extendTrial, grantTrial } from "../_actions";
import { adminDate, adminError, entitlementLabels, money } from "../_lib/presentation";
import { ConfirmOperation } from "./confirm-operation";
import { fieldClass } from "./list-controls";
import { SubscriptionStatus } from "./subscription-status";

type Operation = "trial"|"extend"|"activate"|"change"|"cancel";
function localInput(date:Date){ const adjusted = new Date(date.getTime()-date.getTimezoneOffset()*60_000);return adjusted.toISOString().slice(0,16);}
export function UserDetail({ user, plans }: { user: GetAdminUser200; plans: ListAdminPlans200Item[] }) {
  const router=useRouter(), eligible=plans.filter(p=>p.isActive&&p.audience===user.accountType);
  const [planId,setPlanId]=useState(eligible.find(p=>p.id===user.plan?.id)?.id??eligible[0]?.id??"");
  const [date,setDate]=useState(""), [busy,setBusy]=useState(false), [message,setMessage]=useState(""), [error,setError]=useState(""), [confirm,setConfirm]=useState(false);
  const sub=user.subscription, blocked=sub?.billingProvider==="ASAAS"||!user.accountSetupCompletedAt;
  async function run(operation:Operation) {
    setBusy(true);setMessage("");setError("");
    try {
      let endsAt="";
      if(operation==="trial"||operation==="extend"){ if(!date||!Number.isFinite(new Date(date).getTime()))throw new Error("Escolha a data de término."); endsAt=new Date(date).toISOString(); }
      const result=await (operation==="trial"?grantTrial(user.id,planId,endsAt):operation==="extend"?extendTrial(user.id,endsAt):operation==="activate"?activateSubscription(user.id,planId):operation==="change"?changeSubscriptionPlan(user.id,planId):cancelSubscription(user.id));
      if(!result.success){setError(adminError(result.code));return;}
      setConfirm(false);setMessage(operation==="trial"||operation==="extend"?`Trial confirmado até ${adminDate(result.data.trialEndsAt)}.`:"Alteração confirmada pelo servidor.");
      router.refresh();
    } catch(e){setError(e instanceof Error?e.message:"Não foi possível concluir a operação.");}
    finally{setBusy(false);}
  }
  return <><Link href="/admin/users" className="underline">Voltar aos usuários</Link><header className="break-words"><h1 className="text-2xl font-semibold">{user.name}</h1><p>{user.email}</p></header>
    <section className="grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"><div><p>Tipo: {user.accountType==="COACH"?"Personal":"Atleta"}</p><p>Papel: {user.systemRole}</p><p className="text-sm">Conta criada: {adminDate(user.createdAt)}</p><p className="text-sm">Cadastro: {user.accountSetupCompletedAt?"Concluído":"Incompleto"}</p></div>
      <div><h2 className="font-semibold">{user.plan?.name??"Sem plano"}</h2><SubscriptionStatus value={sub}/>{sub&&<p className="text-sm">Snapshot: {money(sub.priceInCentsSnapshot,sub.currencySnapshot)}</p>}</div>
      {sub&&<div className="space-y-1 text-sm text-muted-foreground sm:col-span-2"><p>Início do trial: {adminDate(sub.trialStartedAt)} · Término: {adminDate(sub.trialEndsAt)}</p><p>Período: {adminDate(sub.currentPeriodStart)} — {adminDate(sub.currentPeriodEnd)}</p><p>Cancelamento: {adminDate(sub.canceledAt)}</p></div>}
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Entitlements efetivos</h2>{user.commercialContext.entitlements.length===0?<p>Nenhum entitlement comercial liberado. Os recursos individuais existentes não são bloqueados por esta tela.</p>:<ul className="list-inside list-disc">{user.commercialContext.entitlements.map(e=><li key={e.key}>{entitlementLabels[e.key]}{e.limitValue!==null?`: ${e.limitValue}`:""}</li>)}</ul>}</section>
    <section className="space-y-4 rounded-2xl border p-5"><h2 className="text-xl font-semibold">Operações comerciais</h2>
      {blocked?<p>{sub?.billingProvider==="ASAAS"?adminError("EXTERNAL_BILLING_MANAGED"):adminError("ACCOUNT_SETUP_REQUIRED")}</p>:<>
        <label className="block">Plano elegível<select className={fieldClass} disabled={busy} value={planId} onChange={e=>setPlanId(e.target.value)}>{eligible.length===0&&<option value="">Nenhum plano elegível</option>}{eligible.map(p=><option key={p.id} value={p.id}>{p.name} · {money(p.monthlyPriceInCents,p.currency)}</option>)}</select></label>
        <label className="block">Término do trial (horário local do dispositivo)<input type="datetime-local" className={fieldClass} disabled={busy} value={date} onChange={e=>setDate(e.target.value)}/></label>
        <div className="flex flex-wrap gap-2">{[7,14,30].map(days=><Button key={days} variant="outline" disabled={busy} onClick={()=>setDate(localInput(new Date(Math.max(Date.now(),sub?.status==="TRIALING"&&sub.trialEndsAt?new Date(sub.trialEndsAt).getTime():0)+days*86400000)))}>{days} dias</Button>)}</div>
        <p className="text-xs text-muted-foreground">Atalhos partem de hoje ou do fim atual do trial, se posterior. A data acima pode ser personalizada. Nenhuma cobrança será realizada.</p>
        <div className="flex flex-wrap gap-3"><Button disabled={busy||!planId||!date} onClick={()=>void run("trial")}>Conceder trial</Button><Button variant="outline" disabled={busy||!planId} onClick={()=>void run("activate")}>Ativar manualmente</Button>
          <Button variant="outline" disabled={busy||!planId||sub?.billingProvider!=="MANUAL"} onClick={()=>void run("change")}>Trocar plano</Button>
          <Button variant="outline" disabled={busy||!date||sub?.billingProvider!=="MANUAL"||!["TRIALING","EXPIRED"].includes(sub?.status??"")} onClick={()=>void run("extend")}>Estender trial</Button>
          <Button variant="destructive" disabled={busy||sub?.billingProvider!=="MANUAL"||sub.status==="CANCELED"} onClick={()=>setConfirm(true)}>Cancelar assinatura</Button></div>
      </>}
      {busy&&<p role="status">Salvando alteração...</p>}{message&&<p role="status">{message}</p>}{error&&<p role="alert" className="text-destructive">{error}</p>}
    </section>
    <ConfirmOperation open={confirm} title="Cancelar acesso manual?" description="O acesso comercial será cancelado imediatamente. A assinatura e o histórico de auditoria serão preservados." busy={busy} onCancel={()=>setConfirm(false)} onConfirm={()=>void run("cancel")}/>
  </>;
}
