import Link from "next/link";
import type { GetAdminOverview200 } from "@/app/_lib/api/fetch-generated";
export function AdminOverview({ data }: { data: GetAdminOverview200 }) {
  const cards = [["Usuários", data.totalUsers], ["Atletas", data.totalAthletes], ["Personals", data.totalCoaches], ["Aguardando liberação", data.pendingCoachSubscriptions], ["Trials ativos", data.activeTrials], ["Assinaturas manuais ativas", data.activeManualSubscriptions], ["Trials efetivamente expirados", data.expiredTrials]] as const;
  return <><header><h1 className="text-2xl font-semibold">Visão geral</h1><p className="text-muted-foreground">Operação comercial manual · sem cobrança integrada</p></header>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{cards.map(([label,value]) => <section key={label} className="rounded-2xl border p-4"><h2 className="text-sm text-muted-foreground">{label}</h2><p className="mt-2 text-3xl font-semibold">{value}</p></section>)}</div>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Pendências</h2><p className="text-sm text-muted-foreground">Personals aguardando liberação</p>
      {data.pendingCoaches.length === 0 ? <p>Nenhuma pendência no momento.</p> : data.pendingCoaches.map(user => <Link key={user.id} href={`/admin/users/${user.id}`} className="block break-words rounded-2xl border p-4 hover:bg-muted"><span className="font-semibold">{user.name}</span><span className="block text-sm">{user.email}</span><span className="text-sm text-muted-foreground">{user.plan?.name} · PENDING</span></Link>)}
      <Link href="/admin/subscriptions" className="inline-block py-3 underline">Ver todas as assinaturas</Link>
    </section></>;
}
