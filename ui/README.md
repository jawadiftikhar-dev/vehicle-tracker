# Fleet Tracker UI

A React single-page application built with **Vite** that fetches 400 vehicle records from the Express backend and renders them in a virtualised, accessible list with URL-synced filters.

---

## Table of contents

- [How to start the UI](#how-to-start-the-ui)
- [How the UI connects to the backend](#how-the-ui-connects-to-the-backend)
- [Features](#features)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Scripts](#scripts)

---

## How to start the UI

Follow these steps exactly, in order. The UI and backend are two separate processes, so you need **two terminals**.

### Step 1 — Start the backend (first terminal)

The UI depends on the Express backend that serves the vehicle data. Without it, the UI will show `Failed to fetch vehicles: 502`.

Open a terminal in the **repo root** — the folder that contains `server.js`, `package.json`, and `scripts/`:

```bash
npm install
npm start