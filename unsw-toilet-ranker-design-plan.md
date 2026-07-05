# UNSW Toilet Ranker — Design Plan (v2)

**Prepared for:** Handoff to Cursor for implementation
**Status:** scope confirmed, ready for build

---

## 1. Project Summary

A mobile-friendly web app for finding, rating, and reviewing bathrooms at UNSW Kensington. The standout feature is a custom-built, floor-by-floor interactive campus map — pick a building, switch levels, see toilets (and their conditions) highlighted on the actual floor plan. Layered on top: ratings/reviews from anyone, admin-managed content, and simple routing to the nearest toilet matching your needs (accessible, has shower, etc.).

**Positioning:** standalone student-tool identity, in the spirit of CSESoc's Freerooms/Notangles — clean, fast, no-nonsense utility. Not under the Sifr brand.

**Scope:** Kensington campus only for v1.

---

## 2. User Roles & Permissions

| Action | Public/Anonymous User | Admin (you) |
|---|---|---|
| Browse map, floor plans, listings | ✅ | ✅ |
| View ratings, reviews, photos | ✅ | ✅ |
| Submit a star rating | ✅ | ✅ |
| Submit a written review | ✅ | ✅ |
| Add/edit toilet entries + floor plan pins | ❌ | ✅ |
| Upload photos | ❌ | ✅ |
| Upload/embed 3D model | ❌ | ✅ |
| Upload/edit floor plan artwork | ❌ | ✅ |
| Moderate/delete reviews | ❌ | ✅ |

**Spam handling (v1):** no login required to post — rate-limited by device/IP + basic profanity filter + admin delete button in dashboard.
**Future feature:** UNSW email (`@ad.unsw.edu.au`) verification via magic link before posting, if spam becomes a real problem. Flagging this now in the data model so it's a small lift later, not a rebuild.

---

## 3. Tech Stack Recommendation

- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Storage)
- **Outdoor map:** Mapbox GL JS or Leaflet + OpenStreetMap, centred on Kensington
- **Indoor floor plans:** custom SVGs (built by you), rendered as interactive layers — see Section 5
- **3D models:** `<model-viewer>` web component for `.glb` files
- **Hosting:** Vercel

---

## 4. Data Model

**`buildings`**
| field | type | notes |
|---|---|---|
| id | uuid | PK |
| name | text | e.g. "Ainsworth Building" |
| latitude, longitude | float | for outdoor map pin |
| floor_count | int | how many levels have floor plans |

**`floor_plans`**
| field | type | notes |
|---|---|---|
| id | uuid | PK |
| building_id | uuid | FK → buildings |
| level | text | e.g. "1", "2", "G", "B1" |
| svg_url | text | your custom floor plan artwork |

**`toilets`**
| field | type | notes |
|---|---|---|
| id | uuid | PK |
| building_id | uuid | FK → buildings |
| floor_plan_id | uuid | FK → floor_plans |
| x, y | float | position on the floor plan SVG (for the pin) |
| name | text | e.g. "Ainsworth L2 Male" |
| gender | enum | male / female / all-gender / accessible |
| has_accessible_stall | bool | |
| has_shower | bool | |
| description | text | admin-only |
| photos | text[] | Supabase Storage URLs |
| model_3d_url | text | nullable |
| created_at | timestamp | |

**`reviews`**
| field | type | notes |
|---|---|---|
| id | uuid | PK |
| toilet_id | uuid | FK → toilets |
| rating | int (1–5) | required |
| comment | text | optional |
| author_label | text | optional, defaults "Anonymous" |
| created_at | timestamp | |
| verified_email | text | nullable — reserved for future email-verification feature |

**Derived:** average rating, review count, and a "cleanliness score" (could just be the average of a cleanliness-specific sub-rating, or reuse overall rating for v1) — used for map colour-coding, leaderboard, and routing filters.

---

## 5. The Floor Plan Feature (headline feature)

Since you're building your own floor plan art as a project in itself:

1. **Reference, don't trace:** MazeMap's existing UNSW maps are a great reference for layout/accuracy, but the artwork should be your own — gives you full control over style (matches your "separate identity" branding) and avoids any IP issues with reusing MazeMap's actual map tiles/data.
2. **Format:** build each floor as a flat SVG (one file per building per level). Keep a consistent canvas size/orientation per building so switching levels feels like flipping a transparent overlay rather than reloading a new image.
3. **Level switcher UI:** simple tab/dropdown ("G / 1 / 2 / 3...") above the floor plan, swaps the active SVG.
4. **Points of interest:** toilets are plotted as `x, y` coordinates on top of the SVG (stored in the `toilets` table) — rendered as clickable pins that open the detail panel. This is admin-only to place, via a simple "click on the map to drop a pin" tool in the admin panel.
5. **Build order suggestion:** start with 2–3 buildings you use most (e.g. Ainsworth, Library, Quad) to prove the pattern before scaling to full campus — this is realistically an ongoing content project, not a one-time build.

---

## 6. Routing Feature (start simple, upgrade path noted)

**v1 (simple):**
- User shares location (browser geolocation) or picks a starting building
- User sets filters: accessible / has shower / minimum rating
- App sorts matching toilets by straight-line distance
- Top result(s) shown with a "Get Directions" button that deep-links to Google Maps walking directions

**Future upgrade path (flagged now, not built yet):**
- Custom in-app walking path using campus walkway data, so directions stay inside the app and can eventually route indoors (which floor, which entrance) — meaningfully bigger build, revisit once outdoor+indoor maps have real data in them.

---

## 7. Core Features Summary (v1)

1. **Outdoor campus map** — building pins, tap through to a building's floor plans
2. **Floor plan view** — level switcher, toilet pins highlighted per floor
3. **Toilet detail page** — photos, description, optional 3D model, ratings, reviews, review submission form
4. **Leaderboard** — ranked list, filterable by building/rating/most-reviewed
5. **Nearest-match routing** — filter by condition, sorted by distance, external directions link
6. **Admin panel** — manage buildings, floor plans, toilet pins, photos, 3D models, review moderation

---

## 8. Pages/Routes

```
/                        → outdoor campus map (home)
/building/[id]           → floor plan view with level switcher
/toilet/[id]             → detail page (ratings, reviews, photos, 3D)
/nearest                 → filter + routing tool
/leaderboard             → rankings
/admin                   → login
/admin/dashboard         → manage buildings/floors/toilets
/admin/floorplan/[id]/edit → pin-placement tool on SVG
```

---

## 9. Build Phases

**Phase 1 — Foundation**
Supabase schema (all tables above), admin login, admin CRUD for buildings/toilets, photo upload.

**Phase 2 — Floor Plan Core**
SVG rendering + level switcher, admin pin-placement tool, toilet pins rendering on floor plans. This is the feature that makes the app distinctive — prioritise getting the pattern right on 1 building first.

**Phase 3 — Public Ratings/Reviews**
Toilet detail page, review submission, rate-limiting/profanity filter, leaderboard.

**Phase 4 — Outdoor Map + Nearest/Routing**
Outdoor building map, geolocation, filter-and-sort nearest tool, Google Maps deep link.

**Phase 5 — Polish & Stretch**
3D model viewer integration, mobile styling pass, expand floor plan coverage to more buildings.

**Later / not in v1:** UNSW email verification for reviews, custom in-app indoor+outdoor routing.

---

## 10. Naming

Worth landing on a short, punchy name before Cursor scaffolds the project (affects repo name, domain, branding). In the Freerooms/Notangles tradition — plain, functional, a little dry-humoured. A few directions to consider: something literal (`ToiletMap`, `WhereToGo`), a pun (`Loo-cation`, `FlushFinder`), or UNSW-flavoured (`UNSWCs`, `CampusCans`). Happy to brainstorm a shortlist if useful.
