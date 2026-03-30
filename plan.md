# Implementation Plan: LuoJiao 落脚

## Overview
LuoJiao is a map-based cultural navigation website for Chinese international students arriving in Los Angeles. It overlays cultural metadata (language spoken, regional cuisine, need stage, transit access) on an interactive Leaflet/OpenStreetMap map. The "First 72 Hours" guided flow is the primary entry point. Mobile-first, bilingual (EN/ZH), deployed to Cloudflare Pages.

## Phase 0: Data Research & Curation
> Claude researches and compiles data. User verifies before build begins.

### Step 0.1 — Research places for seed data
- Web research: "best Chinese restaurants SGV," "USC Chinese student guide," "LA Chinese church young adults," "Mandarin-speaking services LA," etc.
- Compile a raw list of 40-50 candidate places across all 25 subcategories
- For each place, gather: name (EN + ZH), address, coordinates, category, subcategory, languages spoken, and any cultural metadata available from public sources (menus, websites, Google reviews)
- Prioritize the SGV/MPK and USC/University Park corridors

### Step 0.2 — Structure and verify seed data
- Format all places into `data/seed.json` matching the schema
- Assign need_stage, zone, and cultural metadata to each place
- Flag any places that need user verification (uncertain data)
- Target: 30-40 verified places across all 4 need-stage layers

### Step 0.3 — User reviews seed data
- Present compiled data to user for review
- User confirms accuracy, adds corrections, removes bad entries
- Finalize `seed.json`

---

## Phase 1: Foundation (Map + Pins + Data)

### Step 1.1 — Project scaffolding
- Create `index.html` with Tailwind CSS (CDN), Leaflet CSS/JS (CDN)
- Create `src/` directory with TypeScript files
- Create `wrangler.toml` for Cloudflare Pages
- Set up esbuild for TypeScript compilation
- Verify blank page loads locally

### Step 1.2 — D1 database schema
- Create `worker/schema.sql` with tables:
  - `places` — id, name_en, name_zh, address, lat, lng, category, subcategory, need_stage, languages (JSON), zone, transit_accessible, nearest_transit, cultural_corridor, metadata (JSON), last_verified, status
  - `categories` — id, name_en, name_zh, icon, color
  - `corridors` — id, name_en, name_zh, route_number, description_en, description_zh, zones_connected (JSON)
- Create seed script that reads `data/seed.json` and inserts into D1

### Step 1.3 — Hono API worker
- Create `worker/index.ts` with Hono routes:
  - `GET /api/places` — returns all places (with optional query params for filtering)
  - `GET /api/places/:id` — returns single place with full metadata
  - `GET /api/categories` — returns category list
  - `GET /api/corridors` — returns transit corridors
- Bind D1 database in wrangler.toml

### Step 1.4 — Leaflet map initialization
- Create `src/map.ts` — initialize Leaflet map centered on SGV (34.06, -118.13), zoom level 12
- OpenStreetMap tile layer
- Test: map renders, can pan and zoom

### Step 1.5 — Fetch data and render pins
- Create `src/data.ts` — types for Place, Category, Corridor; fetch functions
- Fetch places from API on load
- Render color-coded circle markers on map (5 colors by category)
- Implement marker clustering with Leaflet.markercluster for wide zoom levels
- Test: pins appear on map at correct locations with correct colors

### Step 1.6 — Place detail panel
- Create `src/sidebar.ts`
- Desktop: right sidebar slides in on pin click (40% width)
- Mobile: bottom sheet pattern (collapsed/half/full states)
- Panel shows: name (ZH stacked over EN), category badge, address, languages spoken, need stage, transit info, all metadata fields, "Last verified" date
- "Is this still open?" flag button
- Close button / swipe to dismiss on mobile
- Test: click pin → panel opens with correct data

---

## Phase 2: Filters + Bilingual UI

### Step 2.1 — Filter UI
- Create `src/filters.ts`
- Horizontal filter chip bar at top of map
- 4 filter groups:
  - **Category:** Food, Services, Spiritual, Fun, Academic (color-coded chips)
  - **Need Stage:** Just Arrived, Settling In, Living Here, Working Here
  - **Language:** Mandarin, Cantonese, Bilingual
  - **Zone:** MPK/SGV, USC/University Park, DTLA
- Chips toggle on/off, multiple selections allowed within each group
- Show result count on each chip: "Food (12)"
- Filter pins on map in real-time (no page reload)
- Handle zero-result state gracefully: "No places match these filters. Try removing a filter."

### Step 2.2 — Bilingual i18n system
- Create `src/i18n.ts` — string dictionary for EN and ZH
- All UI chrome (buttons, labels, filter names, headings, empty states) in both languages
- Language toggle button in top-right corner (EN / 中文)
- Persist language preference in localStorage
- Place names always show both languages (stacked), regardless of UI language
- Test: toggle language → all UI updates, place names stay bilingual

### Step 2.3 — Search
- Text search input above filter chips
- Searches place names (EN + ZH), addresses, and subcategories
- Debounced, filters map pins in real-time
- Works in both English and Chinese input
- Clears with X button

---

## Phase 3: "First 72 Hours" + Corridors

### Step 3.1 — "First 72 Hours" onboarding flow
- Create `src/onboarding.ts`
- Default landing experience for new visitors (show once, dismissible)
- Step-by-step guided flow:
  1. Welcome screen: "Just arrived in LA? 刚到洛杉矶？" with Start button
  2. Map zooms to show survival-tier places only (Layer 1 categories)
  3. Cards cycle through essentials: Grocery → SIM card → Bank → Food → Transit
  4. Each card highlights the relevant pins on the map
  5. "Explore more" button exits onboarding to full map view
- "First 72 Hours" button in nav to re-enter the flow anytime
- Printable checklist version (simple CSS print styles)

### Step 3.2 — Transit corridor overlays
- Render transit corridors as colored polylines on the map
- Click corridor → info panel: route name, zones connected, travel time, description
- Example: "770 bus — SGV to USC, ~35 min, runs every 15 min"
- Corridors toggle on/off via a map layer control
- Corridor descriptions bilingual

### Step 3.3 — Mobile optimization pass
- Bottom sheet touch gestures: swipe up to expand, swipe down to collapse
- Filter chips horizontally scrollable on mobile
- Touch targets minimum 44x44px
- Test at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- Map takes full screen on mobile, UI overlays on top
- Performance: lazy-load place details, minimize initial payload

---

## Phase 4: Polish + Deploy

### Step 4.1 — Visual design pass
- Color palette consistent with pin colors
- Typography: larger sizes for Chinese text, system font stack + fallback for CJK
- Subtle animations: panel slide, pin bounce on select, filter chip transitions
- Dark header/nav with map below
- LuoJiao 落脚 logo/wordmark in nav

### Step 4.2 — Privacy and trust
- No cookies, no analytics, no tracking
- Footer note: "No accounts. No tracking. We don't collect your data. 我们不收集任何数据。"
- No external scripts beyond Leaflet and OpenStreetMap tiles

### Step 4.3 — Final verification
- App loads correctly
- All 4 filter dimensions work independently and combined
- "First 72 Hours" flow completes end-to-end
- Language toggle switches all UI
- Transit corridors render and are clickable
- Place detail panel shows all metadata
- "Is this still open?" button works
- Responsive at 375px, 768px, 1024px
- No console errors
- Lighthouse mobile score check

### Step 4.4 — Deploy
- Create GitHub repo: Joshli316/LuoJiao
- Push code
- `wrangler pages deploy .`
- Verify live at luojiao.pages.dev
- Update shell aliases in ~/.zshrc

---

## Files to Create/Modify

### New Files
- `index.html` — Entry point, loads Tailwind + Leaflet + app bundle
- `src/app.ts` — Main app initialization
- `src/map.ts` — Leaflet map setup, pins, clusters, corridors
- `src/filters.ts` — Filter chip UI and filtering logic
- `src/sidebar.ts` — Place detail panel (sidebar + bottom sheet)
- `src/onboarding.ts` — "First 72 Hours" guided flow
- `src/i18n.ts` — Bilingual string dictionary and toggle
- `src/data.ts` — TypeScript types, API fetch functions
- `src/styles.css` — Tailwind directives + custom styles
- `worker/index.ts` — Hono API routes
- `worker/schema.sql` — D1 database schema
- `data/seed.json` — Curated place data (30-40 places)
- `wrangler.toml` — Cloudflare config
- `build.js` — esbuild script
- `package.json` — Dependencies and scripts

### Modify
- `~/.zshrc` — Add `luojiao` alias

---

## Open Questions
1. **Domain:** Use `luojiao.pages.dev` or buy a custom domain?
2. **WeChat sharing:** Add Open Graph meta tags optimized for WeChat's in-app browser in v1?
3. **Offline/PWA:** Add service worker for offline checklist in v1, or defer to v2?

---

## Build Prompt

```
cd ~/Desktop/Projects/LuoJiao

This is a BUILD session, not a planning session. The plan is in `plan.md` and project context is in `CLAUDE.md`. Read both, then implement all steps in order starting from Phase 0 (data research). Don't ask me questions unless you're blocked — make reasonable decisions and keep moving. After implementation, run verification per CLAUDE.md before reporting done.
```
