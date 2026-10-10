"use client";
import { useRef, useState } from "react";
type Page<T> = { items: T[]; nextCursor: string | null; hasMore: boolean };
type Result<T> = { success: true; data: Page<T> } | { success: false; code: string };
export function useAdminPage<T extends { id: string }, F extends object>(initial: Page<T>, loader: (filters: F & { cursor?: string }) => Promise<Result<T>>) {
  const [data,setData] = useState(initial), [loading,setLoading] = useState(false), [error,setError] = useState<string | null>(null);
  const generation = useRef(0), inFlight = useRef(false), applied = useRef({} as F);
  const last = useRef<{ filters: F; append: boolean }>({ filters: {} as F, append: false });
  async function request(filters: F, append: boolean) {
    if (append && (inFlight.current || !data.hasMore || !data.nextCursor)) return;
    const token = ++generation.current;
    if (!append) applied.current = filters;
    last.current = { filters, append };
    inFlight.current = true; setLoading(true); setError(null);
    try {
      const result = await loader({ ...filters, ...(append ? { cursor: data.nextCursor! } : {}) });
      if (token !== generation.current) return;
      if (!result.success) { setError(result.code); return; }
      setData(previous => ({ ...result.data, items: append ? [...new Map([...previous.items, ...result.data.items].map(item => [item.id,item])).values()] : result.data.items }));
    } catch { if (token === generation.current) setError("UNAVAILABLE"); }
    finally { if (token === generation.current) { setLoading(false); inFlight.current = false; } }
  }
  return { data, loading, error, reload: (filters: F) => request(filters, false), more: () => request(applied.current, true), retry: () => request(last.current.filters, last.current.append) };
}
