import Link from "next/link";
import { requireAdminPage } from "./_lib/server";

const links = [["/admin", "Visão geral"], ["/admin/users", "Usuários"], ["/admin/plans", "Planos"], ["/admin/subscriptions", "Assinaturas"], ["/admin/audit", "Auditoria"]];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <div className="min-h-svh bg-background md:grid md:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="border-b p-4 md:sticky md:top-0 md:h-svh md:border-r md:border-b-0">
      <Link href="/" className="text-lg font-semibold">Trainvy</Link><p className="mb-5 text-sm text-muted-foreground">Administração</p>
      <nav aria-label="Administração" className="grid grid-cols-2 gap-2 md:grid-cols-1">{links.map(([href, label]) => <Link key={href} href={href} className="rounded-lg px-3 py-3 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">{label}</Link>)}</nav>
      <Link href="/profile" className="mt-5 block text-sm underline">Voltar ao perfil</Link>
    </aside>
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 px-4 py-6 md:p-8">{children}</main>
  </div>;
}
