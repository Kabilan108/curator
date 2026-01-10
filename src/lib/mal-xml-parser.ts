interface MALEntry {
  malId: number;
  type: "ANIME" | "MANGA";
  title: string;
  score: number;
  status: string;
  episodes?: number;
  chapters?: number;
}

function parseAnimeEntry(entry: Element): MALEntry | null {
  const malId = parseInt(
    entry.querySelector("series_animedb_id")?.textContent || "0",
    10,
  );
  const title = entry.querySelector("series_title")?.textContent || "";
  const score = parseInt(
    entry.querySelector("my_score")?.textContent || "0",
    10,
  );
  const status = entry.querySelector("my_status")?.textContent || "";
  const episodes = parseInt(
    entry.querySelector("my_watched_episodes")?.textContent || "0",
    10,
  );

  if (malId <= 0 || !title) return null;

  return { malId, type: "ANIME", title, score, status, episodes };
}

function parseMangaEntry(entry: Element): MALEntry | null {
  const malId = parseInt(
    entry.querySelector("manga_mangadb_id")?.textContent || "0",
    10,
  );
  const title = entry.querySelector("manga_title")?.textContent || "";
  const score = parseInt(
    entry.querySelector("my_score")?.textContent || "0",
    10,
  );
  const status = entry.querySelector("my_status")?.textContent || "";
  const chapters = parseInt(
    entry.querySelector("my_read_chapters")?.textContent || "0",
    10,
  );

  if (malId <= 0 || !title) return null;

  return { malId, type: "MANGA", title, score, status, chapters };
}

export function parseMALXml(xmlText: string): MALEntry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const animeEntries = Array.from(doc.querySelectorAll("anime"));
  const mangaEntries = Array.from(doc.querySelectorAll("manga"));

  const items: MALEntry[] = [];

  for (const entry of animeEntries) {
    const parsed = parseAnimeEntry(entry);
    if (parsed) items.push(parsed);
  }

  for (const entry of mangaEntries) {
    const parsed = parseMangaEntry(entry);
    if (parsed) items.push(parsed);
  }

  return items;
}

export async function decompressGzip(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const decompressedStream = new Blob([arrayBuffer])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const decompressedBlob = await new Response(decompressedStream).blob();
  return decompressedBlob.text();
}
