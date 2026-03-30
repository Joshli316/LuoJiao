# LuoJiao 落脚

A map-based cultural navigation tool for Chinese international students in Los Angeles. Helps newcomers find places where they belong — not just where things are.

## Tech Stack
- **Frontend:** Static HTML/TypeScript SPA (esbuild bundled)
- **Map:** Leaflet.js + MarkerCluster + OpenStreetMap/CartoDB tiles (no API key)
- **Data:** Embedded JSON (data/places.json, 40 places) — no backend for v1
- **Deploy:** Cloudflare Pages (`wrangler pages deploy .`)

## Structure
```
LuoJiao/
├── index.html          # Entry point
├── src/
│   ├── app.ts          # Main app logic
│   ├── map.ts          # Leaflet map setup, pins, clusters
│   ├── filters.ts      # Filter UI and logic
│   ├── sidebar.ts      # Place detail sidebar / bottom sheet
│   ├── onboarding.ts   # "First 72 Hours" guided flow
│   ├── i18n.ts         # Bilingual EN/ZH string management
│   ├── data.ts         # Data fetching and types
│   └── styles.css      # Tailwind + custom styles
├── data/
│   └── places.json     # Curated place data (40 places)
├── dist/
│   └── app.js          # esbuild output
├── CLAUDE.md
├── plan.md
├── build.js            # esbuild config
├── 404.html            # Bilingual 404 page
├── favicon.svg         # Map pin favicon
├── og-image.jpg        # Social share image (1200x630)
├── robots.txt
└── sitemap.xml
```

## Entry Point
`index.html`

## Build & Deploy
```
npm run build          # esbuild bundles src/app.ts -> dist/app.js
wrangler pages deploy . --project-name=luojiao
```
Live at: https://luojiao.pages.dev

## Conventions
- Bilingual (EN/ZH) — all UI strings and place names in both languages
- Mobile-first design — bottom sheet pattern on mobile, sidebar on desktop
- Place names displayed stacked: 中文名 / English Name
- Chinese text uses larger font sizes than English at same hierarchy level
- 5 pin colors by category: Food (red), Services (blue), Spiritual (purple), Fun (green), Academic (orange)
- Horizontal filter chips, not dropdowns
- No user accounts, no tracking, no data collection
- "Last verified" date shown on every place card

## Data Model
- Core fields as fixed columns (name, coordinates, languages, need_stage, transit)
- Category-specific fields in a `metadata` JSON column
- Hybrid approach for future multi-community scalability

## Verification
- App loads correctly at luojiao.pages.dev
- All 5 filter dimensions work (category, need stage, language, zone, search)
- "First 72 Hours" flow completes end-to-end
- Language toggle switches all UI + place names
- Responsive at 375px (phone), 768px (iPad), 1024px (iPad Pro)
- No console errors
