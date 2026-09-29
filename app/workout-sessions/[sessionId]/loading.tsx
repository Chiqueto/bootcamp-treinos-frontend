export default function WorkoutSessionLoading() {
  return (
    <div className="flex min-h-svh flex-col bg-background pb-24 animate-pulse">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="size-10 rounded-full bg-muted" />
        <div className="h-6 w-36 rounded-md bg-muted" />
        <div className="size-10" />
      </div>

      {/* Info Card Skeleton */}
      <div className="px-5 pt-5">
        <div className="h-32 rounded-2xl bg-muted/60" />
      </div>

      {/* Exercises Skeleton */}
      <div className="flex flex-col gap-4 px-5 pt-6">
        <div className="h-5 w-28 rounded-md bg-muted" />
        <div className="h-44 rounded-xl bg-muted/40" />
        <div className="h-44 rounded-xl bg-muted/40" />
      </div>
    </div>
  );
}
