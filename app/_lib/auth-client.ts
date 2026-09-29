import { createAuthClient } from "better-auth/react";

export function resolveAuthClientBaseUrl(rawApiUrl?: string): string {
  const apiUrl = (rawApiUrl || "http://localhost:8080").trim().replace(/\/+$/, "");
  return apiUrl.endsWith("/api/auth") ? apiUrl : `${apiUrl}/api/auth`;
}

const resolvedBaseUrl = resolveAuthClientBaseUrl(process.env.NEXT_PUBLIC_API_URL);

if (typeof window !== "undefined") {
  console.log("[AUTH CLIENT] BaseURL configurada:", resolvedBaseUrl);
}

export const authClient = createAuthClient({
  baseURL: resolvedBaseUrl,
});
