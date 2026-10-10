export default function Loading() {
  return <div role="status" aria-label="Carregando administração" className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(n => <div key={n} className="h-32 animate-pulse rounded-2xl bg-muted" />)}</div>;
}
