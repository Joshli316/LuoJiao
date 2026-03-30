# LuoJiao 落脚

A map-based cultural navigation tool for Chinese international students in Los Angeles. Helps newcomers find places where they belong — not just where things are.

## Tech Stack
- **Frontend:** Static HTML/TypeScript SPA + Tailwind CSS
- **Map:** Leaflet.js + OpenStreetMap (no API key, no usage limits)
- **Backend:** Cloudflare Workers (Hono) + D1 database
- **Deploy:** Cloudflare Pages

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
├── worker/
│   ├── index.ts        # Hono API routes
│   └── schema.sql      # D1 database schema
├── data/
│   └── seed.json       # Curated place data (30-40 places)
├── CLAUDE.md
├── plan.md
└── wrangler.toml       # Cloudflare config
```

## Entry Point
`index.html`

## Deployment
`wrangler pages deploy .`

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
- App loads correctly at culturalmaps.pages.dev (or luojiao.pages.dev)
- All 5 filters work (category, need stage, language, zone, search)
- "First 72 Hours" flow completes end-to-end
- Language toggle switches all UI + place names
- Responsive at 375px (phone), 768px (iPad), 1024px (iPad Pro)
- No console errors
