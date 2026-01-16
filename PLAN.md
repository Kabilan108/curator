# Mobile Compare Redesign: Option 2 - Overlapping Stacked Cards

## Overview
Cards partially overlap like a hand of playing cards. Tapping one animates it forward as the selection, creating a tactile, game-like experience.

## Visual Design

```
Initial State:                    After Selection:
┌────────────────────────┐       ┌────────────────────────┐
│        Compare         │       │        Compare         │
│  Which one do you...   │       │  Which one do you...   │
│    [ANIME] [MANGA]     │       │    [ANIME] [MANGA]     │
├────────────────────────┤       ├────────────────────────┤
│ ┌──────────────────┐   │       │                        │
│ │   SPY×FAMILY     │   │       │ ┌──────────────────┐   │
│ │   ┌─────────┐    │   │       │ │   SPY×FAMILY     │   │ ← winner
│ │   │  cover  │    │◄──│       │ │   (glowing)      │   │   lifts up
│ │   └─────────┘    │   │       │ └──────────────────┘   │
│ │   Watching 1281  │   │       │    ┌──────────────┐    │
│ └──────────────────┘   │       │    │ Blue Exorcist│    │ ← loser
│    ┌──────────────────┐│       │    │  (faded)     │    │   stays back
│    │  Blue Exorcist   ││       │    └──────────────┘    │
│    │  ┌─────────┐     ││       │                        │
│    │  │  cover  │     ││       ├────────────────────────┤
│    │  └─────────┘     ││       │  Undo [Can't] Skip     │
│    │  Watching 1154   ││       └────────────────────────┘
│    └──────────────────┘│
├────────────────────────┤
│  Undo [Can't] Skip     │
└────────────────────────┘

Cards offset by ~60px vertically, ~20px horizontally
Top card slightly rotated (-2deg), bottom card (+2deg)
```

## Key Changes

### 1. New Mobile Layout Component
Create `MobileComparisonStack` component for the stacked card view

### 2. Stacked Card Styling
- Cards positioned with CSS transforms
- Slight rotation for "hand of cards" feel
- Shadow depth to indicate z-order
- Tap target covers entire card

### 3. Selection Animation
- Selected card: translates up, scales slightly, gains glow
- Unselected card: fades, stays in place
- Use CSS transitions or Framer Motion

### 4. Mobile Detection
Use existing `useIsMobile()` hook from ComparePage.tsx

## Files to Modify

### `src/components/MobileComparisonStack.tsx` (NEW)
New component for the stacked mobile layout

### `src/pages/ComparePage.tsx`
Conditionally render `MobileComparisonStack` on mobile, keep existing grid on desktop

## Implementation Details

### New Component: MobileComparisonStack

```tsx
import { useState } from "react";

interface StackedCardProps {
  item: ComparisonItem;
  ratingDisplay: ReactNode;
  position: "front" | "back";
  disabled: boolean;
  onClick: () => void;
  resultState: ResultState;
}

function StackedCard({ item, ratingDisplay, position, disabled, onClick, resultState }: StackedCardProps) {
  const isFront = position === "front";

  // Position transforms
  const positionStyles = isFront
    ? "z-20 -rotate-2 -translate-y-2"
    : "z-10 rotate-2 translate-y-16 translate-x-4";

  // Result state transforms
  const resultStyles = {
    winner: "z-30 -translate-y-8 scale-105 shadow-2xl shadow-success/30 border-success",
    loser: "opacity-50 scale-95",
    tie: "-translate-y-4 border-primary opacity-80",
    null: ""
  }[resultState ?? "null"];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        absolute inset-x-4 bg-surface border-2 border-border overflow-hidden
        transition-all duration-300 ease-out
        ${positionStyles}
        ${resultStyles}
        ${!resultState && !disabled ? "hover:scale-102 hover:-translate-y-4 hover:shadow-xl" : ""}
      `}
      style={{ top: isFront ? "0" : "0" }}
    >
      <div className="aspect-[3/4] relative">
        <img
          src={item.mediaCoverImage}
          alt={item.mediaTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
          <h3 className="text-base font-bold line-clamp-2">{item.mediaTitle}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 ${STATUS_COLORS[item.watchStatus]}`}>
              {STATUS_LABELS[item.watchStatus]}
            </span>
          </div>
          <div className="font-mono font-bold text-primary">
            {ratingDisplay}
          </div>
        </div>
      </div>
    </button>
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
  // Alternate which card is "front" for fairness (could randomize per pair)
  const [frontItem, backItem] = [item1, item2];
  const [frontRating, backRating] = [ratingDisplay1, ratingDisplay2];

  return (
    <div className="relative h-[420px] mx-auto max-w-[280px]">
      {/* Back card */}
      <StackedCard
        item={backItem}
        ratingDisplay={backRating}
        position="back"
        disabled={disabled}
        onClick={() => onChoice(backItem._id, frontItem._id)}
        resultState={getResultState(backItem._id)}
      />
      {/* Front card */}
      <StackedCard
        item={frontItem}
        ratingDisplay={frontRating}
        position="front"
        disabled={disabled}
        onClick={() => onChoice(frontItem._id, backItem._id)}
        resultState={getResultState(frontItem._id)}
      />
    </div>
  );
}
```

### ComparePage Integration

```tsx
// In the return statement, replace the grid with conditional rendering:

{isMobile ? (
  <MobileComparisonStack
    item1={item1}
    item2={item2}
    ratingDisplay1={getRatingDisplay(item1._id, true)}
    ratingDisplay2={getRatingDisplay(item2._id, false)}
    disabled={isComparing || showResults}
    onChoice={handleChoice}
    getResultState={getResultState}
  />
) : (
  <div className="grid grid-cols-2 gap-4">
    <ComparisonCard ... />
    <ComparisonCard ... />
  </div>
)}
```

## Animation Refinements

### Card Selection Animation
```css
/* Winner animation */
.winner-card {
  transform: translateY(-2rem) scale(1.05);
  box-shadow: 0 25px 50px -12px rgba(var(--success), 0.3);
  border-color: var(--success);
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1); /* spring effect */
}

/* Loser animation */
.loser-card {
  opacity: 0.5;
  transform: scale(0.95);
  transition: all 300ms ease-out;
}
```

### Fairness Consideration
Randomize which card appears in front to avoid positional bias:
```tsx
const [frontIndex] = useState(() => Math.random() > 0.5 ? 0 : 1);
const [frontItem, backItem] = frontIndex === 0 ? [item1, item2] : [item2, item1];
```

## Verification

1. Run `bun run dev` and open http://localhost:5173/compare
2. Resize browser to mobile width (< 768px)
3. Verify:
   - Cards appear stacked with slight offset and rotation
   - Both cards are tappable
   - Tapping a card triggers selection animation
   - Winner card lifts up with glow effect
   - Loser card fades back
   - After result display, new pair loads with stack reset
   - Desktop view unchanged (side-by-side grid)
4. Run `bun run lint` and `bun run build`
