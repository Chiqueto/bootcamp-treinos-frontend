"use client";

import { useState } from "react";
import Image from "next/image";
import { Activity, Dumbbell, Flame, Layers, Leaf, Target } from "lucide-react";
import {
  getWorkoutCoverTheme,
  getWorkoutCoverUrl,
} from "@/app/_lib/workout-covers";

const THEMES = {
  training: { glow: "#2563eb", accent: "#22d3ee", icon: Dumbbell },
  strength: { glow: "#7c3aed", accent: "#c084fc", icon: Flame },
  pull: { glow: "#0891b2", accent: "#5eead4", icon: Activity },
  arms: { glow: "#4f46e5", accent: "#a5b4fc", icon: Dumbbell },
  recovery: { glow: "#059669", accent: "#6ee7b7", icon: Leaf },
};

interface WorkoutCoverProps {
  src?: string | null;
  name?: string;
  variant?: "workout" | "plan" | "cycle";
  isRest?: boolean;
  priority?: boolean;
}

function CoverImage({ src, priority }: { src: string; priority: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
    </div>
  );
}

/** Decorative background. A network-independent fallback always sits beneath the photo. */
export function WorkoutCover({
  src,
  name,
  variant = "workout",
  isRest,
  priority = false,
}: WorkoutCoverProps) {
  const source = getWorkoutCoverUrl(src);
  const theme = THEMES[getWorkoutCoverTheme(name, isRest)];
  const Icon =
    variant === "cycle" ? Layers : variant === "plan" ? Target : theme.icon;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-950"
    >
      <div
        data-cover-theme={getWorkoutCoverTheme(name, isRest)}
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse at 100% 0%, ${theme.glow}99 0%, transparent 65%), radial-gradient(ellipse at 65% 110%, ${theme.accent}33 0%, transparent 60%), linear-gradient(115deg, #020617 10%, #0f172a 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to right, transparent, black)",
        }}
      />
      <div className="absolute -right-10 -top-12 flex size-64 items-center justify-center rounded-full border border-white/10">
        <div className="flex size-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-[inset_0_0_40px_#ffffff08]">
          <Icon
            className="size-24 -rotate-12 opacity-45"
            style={{ color: theme.accent }}
            strokeWidth={1}
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />
      {source && <CoverImage key={source} src={source} priority={priority} />}
    </div>
  );
}
