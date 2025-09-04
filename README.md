# Pantry Tracker (React + Vite + TypeScript)

A lightweight offline-first pantry tracking app. Data is stored locally using IndexedDB (via the `idb` package). No backend required.

Features

- Add, increment/decrement, or remove pantry items
- Categories, quantities, units, minimum thresholds
- Optional expiry date and notes
- Filters: text search, category, status (OK / Low / Expired)
- Demo data seeding

Tech

- React 18 + TypeScript
- Vite build
- IndexedDB storage with `idb`

Local dev

1. Install deps
2. Start dev server

Build

- `npm run build` outputs to `dist/`.
