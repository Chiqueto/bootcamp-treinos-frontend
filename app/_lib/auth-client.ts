import { createAuthClient } from "better-auth/react";

export function resolveAuthClientBaseUrl(rawApiUrl?: string): string {
  if (typeof window !== "undefined" && window.location.origin) {
    if (rawApiUrl && (rawApiUrl.includes("/backend") || rawApiUrl.startsWith("/"))) {
      const url = `${window.location.origin}/backend/api/auth`;
      console.log("[AUTH CLIENT] BaseURL ajustada dinamicamente para mesma origem:", url);
      return url;
    }
  }

  const apiUrl = (rawApiUrl || "http://localhost:8080").trim().replace(/\/+$/, "");
  const resolved = apiUrl.endsWith("/api/auth") ? apiUrl : `${apiUrl}/api/auth`;
  if (typeof window !== "undefined") {
    console.log("[AUTH CLIENT] BaseURL configurada:", resolved);
  }
  return resolved;
}

export const authClient = createAuthClient({
  baseURL: resolveAuthClientBaseUrl(process.env.NEXT_PUBLIC_API_URL),
});
