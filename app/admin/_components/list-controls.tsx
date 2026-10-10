import { Button } from "@/components/ui/button";
import { adminError } from "../_lib/presentation";
export const fieldClass = "min-h-11 w-full min-w-0 rounded-xl border bg-background px-3 py-2 text-sm";
export function ListFooter({ loading, error, hasMore, more, retry }: { loading: boolean; error: string | null; hasMore: boolean; more: () => void; retry: () => void }) {
  return <footer className="space-y-3">{loading && <p role="status">Carregando...</p>}
    {error && <div role="alert"><p>{adminError(error)}</p><Button variant="outline" disabled={loading} onClick={retry}>Tentar novamente</Button></div>}
    {!error && hasMore && <Button variant="outline" disabled={loading} onClick={more}>Carregar mais</Button>}
  </footer>;
}
