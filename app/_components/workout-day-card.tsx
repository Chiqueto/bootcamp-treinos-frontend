import Image from "next/image";
import { Calendar, Timer, Dumbbell } from "lucide-react";
import type { GetHomeData200TodayWorkoutDayWeekDay } from "@/app/_lib/api/fetch-generated";

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: "SEGUNDA",
  TUESDAY: "TERÇA",
  WEDNESDAY: "QUARTA",
  THURSDAY: "QUINTA",
  FRIDAY: "SEXTA",
  SATURDAY: "SÁBADO",
  SUNDAY: "DOMINGO",
};

interface WorkoutDayCardProps {
  name: string;
  weekDay?: GetHomeData200TodayWorkoutDayWeekDay | string;
  estimatedDurationInSeconds: number;
  exercisesCount: number;
  coverImageUrl?: string | null;
  tag?: string;
  rotationLabel?: string;
}

export function WorkoutDayCard({
  name,
  weekDay,
  estimatedDurationInSeconds,
  exercisesCount,
  coverImageUrl,
  tag,
  rotationLabel,
}: WorkoutDayCardProps) {
  const durationInMinutes = Math.round(estimatedDurationInSeconds / 60);

  return (
    <div className="relative flex h-[200px] w-full flex-col items-start justify-between overflow-hidden rounded-xl p-5 shadow-sm transition hover:shadow-md">
      {coverImageUrl && (
        <Image
          src={coverImageUrl}
          alt={name}
          fill
          className="pointer-events-none object-cover"
        />
      )}
      <div className="absolute inset-0 bg-foreground/45" />
      <div className="relative flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-background/20 px-2.5 py-1.5 backdrop-blur-sm">
          <Calendar className="size-3.5 text-background" />
          <span className="font-heading text-xs font-semibold uppercase text-background">
            {tag || (weekDay && WEEKDAY_LABELS[weekDay] ? WEEKDAY_LABELS[weekDay] : "Treino")}
          </span>
        </div>
        {rotationLabel && (
          <div className="rounded-full bg-primary px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
            {rotationLabel}
          </div>
        )}
      </div>
      <div className="relative flex flex-col gap-2">
        <h3 className="font-heading text-2xl font-semibold leading-[1.05] text-background">
          {name}
        </h3>
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1">
            <Timer className="size-3.5 text-background/70" />
            <span className="font-heading text-xs text-background/70">
              {durationInMinutes}min
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="size-3.5 text-background/70" />
            <span className="font-heading text-xs text-background/70">
              {exercisesCount} exercícios
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
