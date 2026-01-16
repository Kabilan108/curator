import type { ReactNode } from "react";
import { useRef, useState } from "react";

type WatchStatus =
  | "COMPLETED"
  | "WATCHING"
  | "PLAN_TO_WATCH"
  | "DROPPED"
  | "ON_HOLD";

interface ComparisonItem {
  _id: string;
  rating: number;
  rd: number;
  comparisonCount: number;
  mediaTitle: string;
  mediaCoverImage: string;
  mediaBannerImage?: string;
  mediaType: "ANIME" | "MANGA";
  mediaGenres: string[];
  watchStatus: WatchStatus;
  startYear?: number | null;
  episodes?: number | null;
  chapters?: number | null;
  format?: string | null;
}

const STATUS_LABELS: Record<WatchStatus, string> = {
  COMPLETED: "Completed",
  WATCHING: "Watching",
  PLAN_TO_WATCH: "Plan to Watch",
  DROPPED: "Dropped",
  ON_HOLD: "On Hold",
};

const STATUS_COLORS: Record<WatchStatus, string> = {
  COMPLETED: "bg-status-completed text-status-completed-fg",
  WATCHING: "bg-status-watching text-status-watching-fg",
  PLAN_TO_WATCH: "bg-status-plan text-status-plan-fg",
  DROPPED: "bg-status-dropped text-status-dropped-fg",
  ON_HOLD: "bg-status-hold text-status-hold-fg",
};

type ResultState = "winner" | "loser" | "tie" | null;

const SWIPE_THRESHOLD = 80;
const TAP_MAX_DURATION = 200;
const TAP_MAX_MOVEMENT = 10;

interface StackedCardProps {
  item: ComparisonItem;
  ratingDisplay: ReactNode;
  visualPosition: "front" | "back";
  isOnTop: boolean;
  resultState: ResultState;
  dragOffset: { x: number; y: number } | null;
  swipeDirection: "left" | "right" | null;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

function StackedCard({
  item,
  ratingDisplay,
  visualPosition,
  isOnTop,
  resultState,
  dragOffset,
  swipeDirection,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: StackedCardProps) {
  const isFront = visualPosition === "front";
  const baseZIndex = isOnTop ? "z-20" : "z-10";
  const positionStyles = isFront
    ? "-rotate-2 -translate-y-2"
    : "rotate-2 translate-y-16 translate-x-4";

  const resultStyles = {
    winner:
      "z-30 -translate-y-8 scale-105 shadow-2xl shadow-success/30 border-success",
    loser: "opacity-50 scale-95",
    tie: "-translate-y-4 border-primary opacity-80",
    null: "",
  }[resultState ?? "null"];

  const isDragging = dragOffset !== null;
  const isPastThreshold =
    isDragging && Math.abs(dragOffset.x) > SWIPE_THRESHOLD;

  const dragTransform = isDragging
    ? `translate(${dragOffset.x}px, ${dragOffset.y * 0.3}px) rotate(${dragOffset.x * 0.08}deg)`
    : "";

  const dragBorderColor = isDragging
    ? isPastThreshold
      ? swipeDirection === "right"
        ? "border-success shadow-success/40 shadow-lg"
        : "border-red-500 shadow-red-500/40 shadow-lg"
      : swipeDirection === "right"
        ? "border-success/50"
        : swipeDirection === "left"
          ? "border-red-500/50"
          : ""
    : "";

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`
        absolute inset-x-4 bg-surface border-2 border-border overflow-hidden rounded-lg
        transition-all duration-300 ease-out select-none touch-none
        ${resultState ? "" : `${baseZIndex} ${positionStyles}`}
        ${resultStyles}
        ${dragBorderColor}
        ${isDragging ? "transition-none" : ""}
      `}
      style={{
        top: 0,
        transform: isDragging ? dragTransform : undefined,
        zIndex: isDragging ? 30 : undefined,
      }}
    >
      <div className="aspect-[3/4] relative pointer-events-none">
        <img
          src={item.mediaCoverImage}
          alt={item.mediaTitle}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {isDragging && isPastThreshold && (
          <div
            className={`absolute top-4 ${swipeDirection === "right" ? "left-4" : "right-4"}
              px-3 py-1.5 rounded-full font-bold text-sm
              ${swipeDirection === "right" ? "bg-success text-success-foreground" : "bg-red-500 text-white"}`}
          >
            {swipeDirection === "right" ? "WIN" : "LOSE"}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
          <h3 className="text-base font-bold line-clamp-2 leading-tight">
            {item.mediaTitle}
          </h3>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] px-1.5 py-0.5 ${STATUS_COLORS[item.watchStatus]}`}
            >
              {STATUS_LABELS[item.watchStatus]}
            </span>
            {item.startYear && (
              <span className="text-[10px] text-foreground-muted bg-white/10 px-1.5 py-0.5">
                {item.startYear}
              </span>
            )}
            {item.mediaType === "ANIME" && item.episodes && (
              <span className="text-[10px] text-foreground-muted bg-white/10 px-1.5 py-0.5">
                {item.episodes} eps
              </span>
            )}
            {item.mediaType === "MANGA" && item.chapters && (
              <span className="text-[10px] text-foreground-muted bg-white/10 px-1.5 py-0.5">
                {item.chapters} ch
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {item.mediaGenres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] text-foreground-muted bg-white/10 px-1.5 py-0.5"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <div className="flex items-center gap-1">
              <span className="text-foreground-muted text-xs">Rating:</span>
              <span className="font-mono font-bold text-base">
                {ratingDisplay}
              </span>
            </div>
            <div className="text-foreground-muted text-xs">
              {item.comparisonCount} comps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MobileComparisonStackProps {
  item1: ComparisonItem;
  item2: ComparisonItem;
  ratingDisplay1: ReactNode;
  ratingDisplay2: ReactNode;
  disabled: boolean;
  onChoice: (winnerId: string, loserId: string) => void;
  getResultState: (itemId: string) => ResultState;
}

export function MobileComparisonStack({
  item1,
  item2,
  ratingDisplay1,
  ratingDisplay2,
  disabled,
  onChoice,
  getResultState,
}: MobileComparisonStackProps) {
  // Visual position is fixed at mount (determines rotation/offset)
  const [visualFrontId] = useState<string>(() =>
    Math.random() > 0.5 ? item1._id : item2._id,
  );
  // Top card changes on tap (only affects z-index)
  const [topCardId, setTopCardId] = useState<string>(visualFrontId);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null,
  );

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    cardId: string;
  } | null>(null);

  const handleTouchStart = (cardId: string) => (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      cardId,
    };
    setActiveCardId(cardId);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || disabled) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = (cardId: string) => () => {
    if (!touchStartRef.current || disabled) return;

    const duration = Date.now() - touchStartRef.current.time;
    const movement = dragOffset
      ? Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2)
      : 0;

    const isTap = duration < TAP_MAX_DURATION && movement < TAP_MAX_MOVEMENT;
    const isSwipe = dragOffset && Math.abs(dragOffset.x) > SWIPE_THRESHOLD;

    if (isTap) {
      setTopCardId(cardId);
    } else if (isSwipe) {
      const isSwipeRight = dragOffset.x > 0;
      const otherCardId = cardId === item1._id ? item2._id : item1._id;
      if (isSwipeRight) {
        onChoice(cardId, otherCardId);
      } else {
        onChoice(otherCardId, cardId);
      }
    }

    touchStartRef.current = null;
    setActiveCardId(null);
    setDragOffset(null);
  };

  const getSwipeDirection = (): "left" | "right" | null => {
    if (!dragOffset) return null;
    if (dragOffset.x > 10) return "right";
    if (dragOffset.x < -10) return "left";
    return null;
  };

  const result1 = getResultState(item1._id);
  const result2 = getResultState(item2._id);
  const showingResults = result1 !== null || result2 !== null;

  // Determine visual positions (fixed at mount)
  const visualFront = visualFrontId === item1._id ? item1 : item2;
  const visualBack = visualFrontId === item1._id ? item2 : item1;
  const visualFrontRating =
    visualFrontId === item1._id ? ratingDisplay1 : ratingDisplay2;
  const visualBackRating =
    visualFrontId === item1._id ? ratingDisplay2 : ratingDisplay1;

  return (
    <div className="relative h-[420px] mx-auto max-w-[280px]">
      {/* Visually back card (may be on top if tapped) */}
      <StackedCard
        item={visualBack}
        ratingDisplay={visualBackRating}
        visualPosition="back"
        isOnTop={topCardId === visualBack._id}
        resultState={getResultState(visualBack._id)}
        dragOffset={activeCardId === visualBack._id ? dragOffset : null}
        swipeDirection={
          activeCardId === visualBack._id ? getSwipeDirection() : null
        }
        onTouchStart={handleTouchStart(visualBack._id)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd(visualBack._id)}
      />
      {/* Visually front card */}
      <StackedCard
        item={visualFront}
        ratingDisplay={visualFrontRating}
        visualPosition="front"
        isOnTop={topCardId === visualFront._id}
        resultState={getResultState(visualFront._id)}
        dragOffset={activeCardId === visualFront._id ? dragOffset : null}
        swipeDirection={
          activeCardId === visualFront._id ? getSwipeDirection() : null
        }
        onTouchStart={handleTouchStart(visualFront._id)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd(visualFront._id)}
      />

      {/* Swipe hint */}
      {!showingResults && !disabled && (
        <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-foreground-muted">
          Swipe right to pick • Swipe left to reject
        </div>
      )}
    </div>
  );
}
