# Fleet Tracker

[![Deploy to Netlify](https://github.com/jawadiftikhar-dev/vehicle-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/jawadiftikhar-dev/vehicle-tracker/actions/workflows/deploy.yml)

A full-stack fleet monitoring dashboard: 400 vehicles streamed in real time over WebSocket, rendered in a virtualised React list, plotted on a Leaflet map, with URL-synced filters, accessible keyboard navigation, and an offline banner.

## Live demo

**[https://vehicle-tracker-project.netlify.app/](https://vehicle-tracker-project.netlify.app/)**

> The backend runs on Render's free tier and may take **30–60 seconds** to wake up after 15 minutes of inactivity. The dashboard shows a loading state during the cold start.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [API endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [Case study](#case-study)
- [Handover guide](#handover-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

Fleet Tracker is a two-process application:

- **Backend** — Node + Express server that generates 400 vehicle records, serves them over `GET /api/vehicles`, and broadcasts a random position update every 5 seconds over `ws://localhost:4000/positions`.
- **Frontend** — React + Vite single-page app that fetches the list, renders it with `react-window` for smooth scrolling, plots markers on a Leaflet map, and updates rows and markers live from the WebSocket feed.

The design choices (WebSocket vs SSE, virtualisation strategy, per-id store) are documented in [`decision-log.md`](./decision-log.md).

---

## Features

### Backend (Task 1)
- `GET /api/vehicles` returns **400 generated vehicle records** (`id`, `status`, `lat`, `lng`, `speed`, `region`).
- `ws://localhost:4000/positions` broadcasts a position update for a random vehicle every **5 seconds**.
- `scripts/generateVehicles.js` produces realistic region-aware sample data.
- Trade-off analysis in [`decision-log.md`](./decision-log.md) explains why WebSocket was chosen over SSE.

### Frontend — list (Task 2)
- **Virtualised list** with `react-window` — all 400 vehicles scroll smoothly at 60 fps because only visible rows are mounted.
- **URL-synced filters** for `status` and `region` — changing a filter updates `?status=&region=`, and reloading the page restores the same filter.
- **Accessible rows** — `role="listitem"`, `aria-label`, `aria-setsize`, `aria-posinset`, roving `tabIndex`, and Arrow Up/Down navigation.

### Frontend — live updates (Task 3)
- **Per-id WebSocket updates** — a message for `VH-0047` re-renders only that row, verified in React DevTools Profiler. The mechanism lives in `ui/src/store/vehicleStore.js` (per-id listener map) and `ui/src/components/VehicleRow.jsx` (`useSyncExternalStore`).
- **Leaflet map** (`MapPanel`) shows markers for the focused vehicle and its neighbours, moving in real time as positions change.
- **Focus ↔ marker sync** — Arrow-key navigation in the list highlights the matching marker on the map via shared `focusedId` state.
- **Offline banner** — `OfflineBanner` appears at the top of the page when the WebSocket disconnects and disappears on reconnect.

### Security & quality (Task 4)
- **Lighthouse reports** committed in [`reports/pre-audit.json`](./reports/pre-audit.json) and [`reports/post-audit.json`](./reports/post-audit.json).
- **Content-Security-Policy** header served via `netlify.toml` — `script-src 'self'`, no `'unsafe-inline'`.
- **DOMPurify sanitization** — every dynamic HTML insertion in `app.js` and any React `dangerouslySetInnerHTML` is sanitized.
- **Jest unit tests** — 7 tests covering the vehicle parser (`parseVehicle`) and position updates (`applyPositionUpdate`).

### CI/CD (Task 5)
- **GitHub Actions** workflow builds the UI and deploys to Netlify on every push to `main`.
- **Backend URL override** via the `VITE_API_BASE` environment variable — the same code runs against `localhost:4000` in dev and a Render URL in production.
- **Case study** in [`reports/case-study.md`](./reports/case-study.md) covering problem, solution, metrics, and trade-offs.
- **Handover guide** in [`HANDOVER.md`](./HANDOVER.md) covering local + Render setup.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, `ws` (WebSocket) |
| Frontend | React 18, Vite, `react-window`, `react-leaflet`, `react-router-dom` |
| Security | DOMPurify, CSP via `netlify.toml` |
| Testing | Jest, Babel, `jest-environment-jsdom` |
| CI/CD | GitHub Actions, Netlify CLI |
| Hosting | Netlify (frontend), Render free tier (backend) |

---

## Project structure