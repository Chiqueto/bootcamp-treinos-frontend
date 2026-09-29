/**
 * Helper utilitário para conversão entre gramas (backend) e quilogramas (frontend).
 * O backend persiste exclusivamente inteiros (weightInGrams >= 0).
 * O frontend exibe e recebe valores em kg (ex: 30.5).
 */

/**
 * Converte gramas (inteiro do backend) para kg (número ou null).
 * Ex: 30500 -> 30.5
 * Ex: 30000 -> 30
 * Ex: null | undefined -> null
 */
export function gramsToKg(grams: number | null | undefined): number | null {
  if (grams === null || grams === undefined) {
    return null;
  }
  const kg = grams / 1000;
  // Arredonda para 2 casas decimais e remove zeros desnecessários
  return Number(kg.toFixed(2));
}

/**
 * Converte gramas para string formatada para input ou exibição.
 * Ex: 30500 -> "30.5"
 * Ex: null -> ""
 */
export function gramsToKgString(grams: number | null | undefined): string {
  const kg = gramsToKg(grams);
  if (kg === null) return "";
  return kg.toString();
}

/**
 * Converte quilogramas (string ou número do frontend) para gramas (inteiro para o backend).
 * Suporta vírgula e ponto decimal.
 * Ex: "30.5" -> 30500
 * Ex: "30,5" -> 30500
 * Ex: 30.5 -> 30500
 * Ex: "" ou null -> null
 */
export function kgToGrams(
  kg: string | number | null | undefined,
): number | null {
  if (kg === null || kg === undefined) {
    return null;
  }

  if (typeof kg === "string") {
    const trimmed = kg.trim();
    if (trimmed === "") return null;
    const normalized = trimmed.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (isNaN(parsed) || parsed < 0) return null;
    return Math.round(parsed * 1000);
  }

  if (typeof kg === "number") {
    if (isNaN(kg) || kg < 0) return null;
    return Math.round(kg * 1000);
  }

  return null;
}
