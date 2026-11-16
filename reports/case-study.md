# Case Study — Fleet Tracker Dashboard

## Problem

The Fleet Tracker UI needed to go from a local-only development setup to a publicly reachable demo that:
1. Builds and deploys automatically on every push to `main`.
2. Points at a backend that can be swapped without code changes.
3. Runs on free-tier infrastructure for both frontend and backend.

The main constraints were:
- GitHub Pages cannot run the Express backend, so the frontend and backend had to be split.
- Netlify's free tier supports static sites and serverless functions but not persistent WebSocket servers, so the backend needed Render.
- Vite bakes `import.meta.env.VITE_*` variables into the build at build time, so the backend URL must be present during the CI build, not at runtime [reference:9].

## Solution

### Architecture
