export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "FOREARMS"
  | "QUADRICEPS"
  | "HAMSTRINGS"
  | "GLUTES"
  | "ADDUCTORS"
  | "HIP_ABDUCTORS"
  | "CALVES"
  | "CORE";

export type MuscleRole = "PRIMARY" | "SECONDARY";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: "Peito",
  BACK: "Costas",
  SHOULDERS: "Ombros",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  FOREARMS: "Antebraços",
  QUADRICEPS: "Quadríceps",
  HAMSTRINGS: "Posteriores",
  GLUTES: "Glúteos",
  ADDUCTORS: "Adutores",
  HIP_ABDUCTORS: "Abdutores",
  CALVES: "Panturrilhas",
  CORE: "Core",
};

export const ALL_MUSCLE_GROUPS: Array<{ value: MuscleGroup; label: string }> = [
  { value: "CHEST", label: "Peito" },
  { value: "BACK", label: "Costas" },
  { value: "SHOULDERS", label: "Ombros" },
  { value: "BICEPS", label: "Bíceps" },
  { value: "TRICEPS", label: "Tríceps" },
  { value: "FOREARMS", label: "Antebraços" },
  { value: "QUADRICEPS", label: "Quadríceps" },
  { value: "HAMSTRINGS", label: "Posteriores" },
  { value: "GLUTES", label: "Glúteos" },
  { value: "ADDUCTORS", label: "Adutores" },
  { value: "HIP_ABDUCTORS", label: "Abdutores" },
  { value: "CALVES", label: "Panturrilhas" },
  { value: "CORE", label: "Core" },
];

export function getMuscleGroupLabel(group?: string | null): string {
  if (!group) return "";
  return MUSCLE_GROUP_LABELS[group as MuscleGroup] || group;
}
