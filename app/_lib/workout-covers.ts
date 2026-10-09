// Galeria de imagens temáticas de alta qualidade para capas de treino (Dark / Fitness)
export const WORKOUT_COVER_FALLBACKS = {
  LEGS: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=1200&q=80",
  CHEST_PUSH: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80",
  BACK_PULL: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1200&q=80",
  ARMS_SHOULDERS: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80",
  FULLBODY: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
  REST: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  DEFAULT: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
};

/**
 * Retorna a capa explícita ou um fallback temático atraente baseado no nome do dia/treino.
 */
export function getWorkoutCoverUrl(
  explicitUrl?: string | null,
  dayName?: string | null,
  isRest?: boolean,
): string {
  if (explicitUrl && explicitUrl.trim().startsWith("http")) {
    return explicitUrl.trim();
  }

  if (isRest) {
    return WORKOUT_COVER_FALLBACKS.REST;
  }

  const name = (dayName || "").toLowerCase().trim();

  if (
    name.includes("perna") ||
    name.includes("leg") ||
    name.includes("quadr") ||
    name.includes("glúteo") ||
    name.includes("gluteo") ||
    name.includes("inferior") ||
    name.includes("squat")
  ) {
    return WORKOUT_COVER_FALLBACKS.LEGS;
  }

  if (
    name.includes("peito") ||
    name.includes("chest") ||
    name.includes("push") ||
    name.includes("supino") ||
    name.includes("empurrar")
  ) {
    return WORKOUT_COVER_FALLBACKS.CHEST_PUSH;
  }

  if (
    name.includes("costa") ||
    name.includes("dorsal") ||
    name.includes("pull") ||
    name.includes("remada") ||
    name.includes("puxar")
  ) {
    return WORKOUT_COVER_FALLBACKS.BACK_PULL;
  }

  if (
    name.includes("ombro") ||
    name.includes("braço") ||
    name.includes("braco") ||
    name.includes("bíceps") ||
    name.includes("biceps") ||
    name.includes("tríceps") ||
    name.includes("triceps") ||
    name.includes("deltoide")
  ) {
    return WORKOUT_COVER_FALLBACKS.ARMS_SHOULDERS;
  }

  if (
    name.includes("descanso") ||
    name.includes("rest") ||
    name.includes("recupera") ||
    name.includes("alongamento")
  ) {
    return WORKOUT_COVER_FALLBACKS.REST;
  }

  if (
    name.includes("full") ||
    name.includes("total") ||
    name.includes("corpo") ||
    name.includes("superior") ||
    name.includes("upper")
  ) {
    return WORKOUT_COVER_FALLBACKS.FULLBODY;
  }

  return WORKOUT_COVER_FALLBACKS.DEFAULT;
}
