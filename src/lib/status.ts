export type WatchStatus =
  | "COMPLETED"
  | "WATCHING"
  | "PLAN_TO_WATCH"
  | "DROPPED"
  | "ON_HOLD";

export type MediaType = "ANIME" | "MANGA";

export const STATUS_CYCLE: WatchStatus[] = [
  "PLAN_TO_WATCH",
  "WATCHING",
  "COMPLETED",
  "ON_HOLD",
  "DROPPED",
];

export const STATUS_CONFIG: Record<
  WatchStatus,
  { label: string; mangaLabel?: string; className: string }
> = {
  COMPLETED: {
    label: "Completed",
    className:
      "bg-status-completed text-status-completed-fg border-transparent",
  },
  WATCHING: {
    label: "Watching",
    mangaLabel: "Reading",
    className: "bg-status-watching text-status-watching-fg border-transparent",
  },
  PLAN_TO_WATCH: {
    label: "Plan to Watch",
    mangaLabel: "Plan to Read",
    className: "bg-status-plan text-status-plan-fg border-transparent",
  },
  DROPPED: {
    label: "Dropped",
    className: "bg-status-dropped text-status-dropped-fg border-transparent",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-status-hold text-status-hold-fg border-transparent",
  },
};

export function getStatusLabel(
  status: WatchStatus,
  mediaType: MediaType,
): string {
  const config = STATUS_CONFIG[status];
  if (mediaType === "MANGA" && config.mangaLabel) {
    return config.mangaLabel;
  }
  return config.label;
}
