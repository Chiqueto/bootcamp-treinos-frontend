// Shared with next.config.ts: unsupported hosts must never reach next/image.
export const WORKOUT_IMAGE_REMOTE_PATTERNS = [
  { protocol: "https" as const, hostname: "*.ufs.sh" },
  { protocol: "https" as const, hostname: "images.unsplash.com" },
];

export function getWorkoutCoverUrl(explicitUrl?: string | null): string | null {
  const source = explicitUrl?.trim();
  if (!source) return null;
  // Only root-relative local assets (not protocol-relative URLs).
  if (
    source.startsWith("/") &&
    !source.startsWith("//") &&
    !source.includes("\\")
  )
    return source;
  try {
    const url = new URL(source);
    if (url.username || url.password || url.port) return null;
    const supported = WORKOUT_IMAGE_REMOTE_PATTERNS.some((pattern) => {
      const host = pattern.hostname;
      return (
        url.protocol === `${pattern.protocol}:` &&
        (host.startsWith("*.")
          ? url.hostname.endsWith(host.slice(1)) &&
            url.hostname.split(".").length === host.split(".").length
          : url.hostname === host)
      );
    });
    return supported ? url.href : null;
  } catch {
    return null;
  }
}

export function getWorkoutCoverTheme(name?: string | null, isRest = false) {
  const normalized = (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (isRest || /descanso|rest|recupera|alongamento/.test(normalized))
    return "recovery";
  if (/perna|leg|quadr|gluteo|inferior|lower|squat/.test(normalized))
    return "strength";
  if (/costa|dorsal|pull|remada|puxar/.test(normalized)) return "pull";
  if (/ombro|braco|biceps|triceps|deltoide/.test(normalized)) return "arms";
  return "training";
}
