const ANILIST_API_URL = "https://graphql.anilist.co";

export interface AniListMedia {
  id: number;
  idMal: number | null;
  type: "ANIME" | "MANGA";
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string | null;
  genres: string[];
  tags: Array<{
    name: string;
    rank: number;
  }>;
  format: string | null;
  status: string | null;
  episodes: number | null;
  chapters: number | null;
  averageScore: number | null;
  popularity: number | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
}

interface AniListSearchResponse {
  data: {
    Page: {
      media: AniListMedia[];
      pageInfo: {
        total: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
      };
    };
  };
}

interface AniListMediaResponse {
  data: {
    Media: AniListMedia;
  };
}

const SEARCH_QUERY = `
  query ($page: Int, $perPage: Int, $search: String, $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(search: $search, type: $type, sort: POPULARITY_DESC) {
        id
        idMal
        type
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          extraLarge
        }
        bannerImage
        genres
        tags {
          name
          rank
        }
        format
        status
        episodes
        chapters
        averageScore
        popularity
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
      }
    }
  }
`;

const MEDIA_QUERY = `
  query ($id: Int) {
    Media(id: $id) {
      id
      idMal
      type
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        extraLarge
      }
      bannerImage
      genres
      tags {
        name
        rank
      }
      format
      status
      episodes
      chapters
      averageScore
      popularity
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
    }
  }
`;

export async function searchAniList(
  searchTerm: string,
  type?: "ANIME" | "MANGA",
  page: number = 1,
  perPage: number = 20
): Promise<AniListSearchResponse["data"]["Page"]> {
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: {
        search: searchTerm,
        type,
        page,
        perPage,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.statusText}`);
  }

  const data: AniListSearchResponse = await response.json();
  return data.data.Page;
}

export async function getAniListMedia(id: number): Promise<AniListMedia> {
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: MEDIA_QUERY,
      variables: { id },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.statusText}`);
  }

  const data: AniListMediaResponse = await response.json();
  return data.data.Media;
}
