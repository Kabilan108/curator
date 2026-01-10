import type { JSX, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface ComparisonItem {
  _id: string;
  eloRating: number;
  comparisonCount: number;
  media?: {
    title: string;
    coverImage: string;
    bannerImage?: string;
    type: string;
    format?: string;
    genres?: string[];
  } | null;
}

interface ComparisonCardProps {
  item: ComparisonItem;
  ratingDisplay: ReactNode;
  disabled: boolean;
  onClick: () => void;
}

export function ComparisonCard({
  item,
  ratingDisplay,
  disabled,
  onClick,
}: ComparisonCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="bg-neutral-900 border-2 border-neutral-800 overflow-hidden hover:border-blue-500 transition-all disabled:opacity-50 text-left focus:outline-none focus:border-blue-500"
    >
      <div className="aspect-video bg-neutral-800 relative overflow-hidden">
        {item.media?.bannerImage ? (
          <img
            src={item.media.bannerImage}
            alt={item.media.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={item.media?.coverImage}
            alt={item.media?.title}
            className="w-full h-full object-cover blur-lg scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-20 h-28 bg-neutral-800 overflow-hidden flex-shrink-0">
            {item.media?.coverImage && (
              <img
                src={item.media.coverImage}
                alt={item.media.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              {item.media?.title}
            </h3>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {item.media?.type}
              </Badge>
              {item.media?.format && (
                <Badge variant="outline" className="text-xs">
                  {item.media.format}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="space-y-1">
            <div className="text-neutral-400">Rating</div>
            <div className="text-2xl font-bold font-mono">{ratingDisplay}</div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-neutral-400">Comparisons</div>
            <div className="text-lg font-medium">{item.comparisonCount}</div>
          </div>
        </div>

        {item.media?.genres && item.media.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.media.genres.slice(0, 4).map((genre: string) => (
              <span
                key={genre}
                className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
