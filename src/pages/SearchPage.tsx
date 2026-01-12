import { useMutation, useQuery } from "convex/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { SearchResultCard } from "@/components/SearchResultCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type AniListMedia, searchAniList } from "@/lib/anilist";
import { api } from "../../convex/_generated/api";

type WatchStatus =
  | "COMPLETED"
  | "WATCHING"
  | "PLAN_TO_WATCH"
  | "DROPPED"
  | "ON_HOLD";

export function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "ANIME" | "MANGA">("ALL");
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [activeStatusPicker, setActiveStatusPicker] = useState<number | null>(
    null,
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Query existing library items
  const libraryAnilistIds = useQuery(api.library.getAnilistIds);
  const libraryIdsSet = new Set(libraryAnilistIds ?? []);

  const upsertMedia = useMutation(api.media.upsertMediaItem);
  const addToLibrary = useMutation(api.library.addToLibrary);

  const handleSearch = async (page: number = 1, append: boolean = false) => {
    if (!searchTerm.trim()) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setResults([]);
    }

    try {
      const type = filter === "ALL" ? undefined : filter;
      const pageData = await searchAniList(searchTerm, type, page);

      if (append) {
        setResults((prev) => [...prev, ...pageData.media]);
      } else {
        setResults(pageData.media);
      }

      setCurrentPage(page);
      setHasNextPage(pageData.pageInfo.hasNextPage);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    handleSearch(currentPage + 1, true);
  };

  // Helper to convert null values to undefined for Convex compatibility
  const cleanDate = (
    date:
      | { year?: number | null; month?: number | null; day?: number | null }
      | null
      | undefined,
  ) => {
    if (!date) return undefined;
    return {
      year: date.year ?? undefined,
      month: date.month ?? undefined,
      day: date.day ?? undefined,
    };
  };

  const handleAddToLibrary = async (
    media: AniListMedia,
    status: WatchStatus,
  ) => {
    try {
      // First, upsert the media item
      const mediaId = await upsertMedia({
        anilistId: media.id,
        malId: media.idMal ?? undefined,
        type: media.type,
        title: media.title.romaji,
        titleEnglish: media.title.english ?? undefined,
        titleJapanese: media.title.native ?? undefined,
        description: media.description ?? undefined,
        coverImage: media.coverImage.extraLarge,
        bannerImage: media.bannerImage ?? undefined,
        genres: media.genres,
        tags: media.tags.map((t) => t.name),
        format: media.format ?? undefined,
        status: media.status ?? undefined,
        episodes: media.episodes ?? undefined,
        chapters: media.chapters ?? undefined,
        averageScore: media.averageScore ?? undefined,
        popularity: media.popularity ?? undefined,
        startDate: cleanDate(media.startDate),
        endDate: cleanDate(media.endDate),
      });

      // Then add to library with selected status
      await addToLibrary({
        mediaItemId: mediaId,
        watchStatus: status,
      });

      setAddedItems((prev) => new Set(prev).add(media.id));
      setActiveStatusPicker(null);
    } catch (error) {
      console.error("Failed to add to library:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-foreground-muted mt-2">
          Find anime and manga to add to your library
        </p>
      </div>

      {/* Search bar */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search for anime or manga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 bg-surface border-border"
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {(["ALL", "ANIME", "MANGA"] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              onClick={() => setFilter(type)}
              size="sm"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((media) => (
              <SearchResultCard
                key={media.id}
                media={media}
                isInLibrary={
                  libraryIdsSet.has(media.id) || addedItems.has(media.id)
                }
                showStatusPicker={activeStatusPicker === media.id}
                onToggleStatusPicker={() =>
                  setActiveStatusPicker(
                    activeStatusPicker === media.id ? null : media.id,
                  )
                }
                onAddToLibrary={(status) => handleAddToLibrary(media, status)}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-[200px]"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="text-center text-foreground-muted py-12">
          Searching...
        </div>
      ) : (
        <div className="text-center text-foreground-subtle py-12">
          Search for anime or manga to get started
        </div>
      )}
    </div>
  );
}
