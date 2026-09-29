import { createAuthClient } from "better-auth/react";

export function resolveAuthClientBaseUrl(rawApiUrl?: string): string {
  if (typeof window !== "undefined" && window.location.origin) {
    if (rawApiUrl && (rawApiUrl.includes("/backend") || rawApiUrl.startsWith("/"))) {
      return `${window.location.origin}/backend/api/auth`;
    }
  }

  const apiUrl = (rawApiUrl || "http://localhost:8080").trim().replace(/\/+$/, "");
  return apiUrl.endsWith("/api/auth") ? apiUrl : `${apiUrl}/api/auth`;
}

export const authClient = createAuthClient({
  baseURL: resolveAuthClientBaseUrl(process.env.NEXT_PUBLIC_API_URL),
});
