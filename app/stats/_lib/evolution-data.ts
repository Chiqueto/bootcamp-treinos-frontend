import type {
  GetExerciseEvolution200ItemsItem,
  GetWeeklyTrainingAnalytics200WeeksItem,
} from "@/app/_lib/api/fetch-generated";

export function summarizeWeeks(
  weeks: GetWeeklyTrainingAnalytics200WeeksItem[],
) {
  return weeks.reduce(
    (summary, week) => ({
      totalWorkouts: summary.totalWorkouts + week.workoutsCompleted,
      totalWorkingSets: summary.totalWorkingSets + week.workingSets,
      totalLoadVolumeKg: summary.totalLoadVolumeKg + week.loadVolumeKg,
      totalDurationInSeconds:
        summary.totalDurationInSeconds + week.totalDurationInSeconds,
    }),
    {
      totalWorkouts: 0,
      totalWorkingSets: 0,
      totalLoadVolumeKg: 0,
      totalDurationInSeconds: 0,
    },
  );
}

export function appendUniqueEvolutionSessions(
  current: GetExerciseEvolution200ItemsItem[],
  incoming: GetExerciseEvolution200ItemsItem[],
) {
  const seen = new Set(current.map((item) => item.workoutSessionId));
  const unique = incoming.filter((item) => {
    if (seen.has(item.workoutSessionId)) return false;
    seen.add(item.workoutSessionId);
    return true;
  });
  return [...current, ...unique];
}
