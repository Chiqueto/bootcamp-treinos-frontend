"use server";

import { revalidatePath } from "next/cache";
import {
  updateGamificationTheme,
  type UpdateGamificationThemeBodyTheme,
} from "@/app/_lib/api/fetch-generated";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateUserThemeAction(
  theme: UpdateGamificationThemeBodyTheme,
): Promise<ActionResult<{ gamificationTheme: string }>> {
  try {
    const res = await updateGamificationTheme({ theme });
    if (res.status !== 200) {
      const errorMsg =
        (res.data as { error?: string })?.error ||
        "Não foi possível salvar o tema escolhido";
      return { success: false, error: errorMsg };
    }

    revalidatePath("/profile");
    revalidatePath("/");
    return {
      success: true,
      data: { gamificationTheme: res.data.gamificationTheme },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        (err as Error)?.message ||
        "Erro de conexão ao salvar a preferência de tema",
    };
  }
}
