import { createAuthClient } from "better-auth/react";

export function resolveAuthClientBaseUrl(rawApiUrl?: string): string {
  const apiUrl = (rawApiUrl || "http://localhost:8080").trim().replace(/\/+$/, "");
  return apiUrl.endsWith("/api/auth") ? apiUrl : `${apiUrl}/api/auth`;
}

export const authClient = createAuthClient({
  baseURL: resolveAuthClientBaseUrl(process.env.NEXT_PUBLIC_API_URL),
});
