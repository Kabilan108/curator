# Curator - Development Log

## 🎯 Feature Ideas & Roadmap

### Phase 2 Features (Post-MVP)
- **Statistics & Insights Dashboard**
  - Elo rating distribution chart
  - Genre preferences breakdown
  - Watch time/reading time estimates
  - Comparison count heatmap

- **Advanced Filtering & Search**
  - Multi-criteria filtering (genre, custom fields, Elo range)
  - Full-text search across titles and notes
  - Saved filter presets

- **Recommendations Engine**
  - ML-based recommendations using Elo ratings
  - Custom field correlation analysis
  - Similar items suggestions

- **MAL Import**
  - Import from MyAnimeList username
  - Bulk import with status preservation
  - Merge with existing library

- **Data Export/Import**
  - Export library as JSON/CSV
  - Backup and restore functionality
  - Share library with others

### Future Considerations
- PWA support for offline access
- Comparison history view
- Custom Elo K-factor tuning
- Multi-user support (multiplayer rankings?)
- Social features (compare libraries with friends)

---

## 📝 Development Log

### 2026-01-08 - MVP Core Features Implementation

**Backend (Convex)**
- Created complete database schema (`convex/schema.ts`)
  - `mediaItems`: AniList metadata catalog
  - `userLibrary`: User's tracked items with Elo ratings
  - `comparisons`: Comparison history for tracking
  - `customFields` & `customFieldValues`: Future custom metadata system
- Implemented Convex server functions:
  - `library.ts`: CRUD operations for user library
  - `media.ts`: Upsert and fetch media items from AniList
  - `comparisons.ts`: Elo ranking algorithm with adaptive K-factor
- Elo implementation uses decreasing K-factor (40→16) based on comparison count

**Frontend Architecture**
- Set up React Router with 4 main routes
- Created mobile-first layout with fixed bottom navigation
- Integrated Convex React client in main.tsx
- Dark mode works out-of-the-box with Shadcn neutral theme

**Features Implemented**
1. **Library View** (`/`)
   - Grid display of user's collection
   - Sorted by Elo rating (highest first)
   - Shows Elo rating and comparison count for each item
   - Empty state with call-to-action

2. **Search & Add** (`/search`)
   - Full AniList GraphQL API integration
   - Search with type filter (All/Anime/Manga)
   - Rich metadata display (cover, genres, scores, episodes/chapters)
   - One-click add to library with status tracking
   - Visual feedback for already-added items

3. **Comparison Interface** (`/compare`)
   - Side-by-side comparison of random pairs
   - Beautiful card design with banners and covers
   - Shows current Elo rating and comparison count
   - Real-time rating updates after each comparison
   - Empty state for libraries with <2 items

**Technical Highlights**
- AniList GraphQL integration (`src/lib/anilist.ts`)
- Type-safe Convex queries and mutations throughout
- Responsive design optimized for mobile
- Proper loading and error states
