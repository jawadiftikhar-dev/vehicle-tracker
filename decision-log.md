# Decision Log — Task 1

## 1. Vehicle Data Schema

| Field  | Type   | Description                                   |
|--------|--------|-----------------------------------------------|
| id     | string | Unique vehicle identifier (e.g. `VH-0001`)    |
| status | string | One of `active`, `idle`, `maintenance`, `offline` |
| lat    | number | Latitude (WGS84)                              |
| lng    | number | Longitude (WGS84)                             |
| speed  | number | Current speed in km/h                         |
| region | string | One of `North`, `South`, `East`, `West`, `Central` |

Rationale: minimal, flat, and easy to serialize over both REST and WebSocket. Coordinates kept as separate numeric fields (not a nested object) so clients can plot them without transformation.

## 2. WebSocket vs. SSE for Live Updates

### WebSocket
**Pros**
- Full duplex — client can send commands (e.g. subscribe to a specific vehicle).
- Binary support, low per‑message overhead after the handshake.
- Widely supported (browsers, Node, mobile).

**Cons**
- More complex to scale behind load balancers (sticky sessions or a pub/sub layer).
- Requires its own heartbeat/reconnect logic.
- No native HTTP caching or auto‑reconnect.

### Server‑Sent Events (SSE)
**Pros**
- Simple unidirectional server→client stream over plain HTTP.
- Auto‑reconnect and `Last-Event-ID` replay built into the browser API.
- Works through proxies/load balancers without special config.

**Cons**
- One‑way only — client must use a separate HTTP request to send data.
- HTTP/1.1 limits (≈6 connections per origin) unless HTTP/2 is used.
- Text‑only (`text/event-stream`); no binary.

### Decision
**WebSocket (`ws://localhost:4000/positions`)** was chosen because:
1. The live feed may later need client→server messages (e.g. filter subscriptions, ack).
2. Low per‑message overhead matters for frequent position updates.
3. The project already runs a Node/Express server, so adding `ws` is trivial.

SSE remains a valid fallback for read‑only dashboards and would be preferred if the server ever needs to sit behind restrictive proxies.

## 3. Broadcast Cadence
Positions are broadcast **every 5 seconds** for one random vehicle per tick. This matches the requirement and keeps bandwidth low during development. A production system would batch or stream deltas per vehicle per tick.