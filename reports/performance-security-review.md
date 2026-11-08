# Performance & Security Review — Task 4

## 1. Lighthouse Audits

### Pre-optimization (development build)

- URL: `http://localhost:5173`
- Report: `pre-audit.json`
- Key finding: Development mode includes HMR, React Refresh, and unminified bundles, which significantly lower Performance scores. These are not representative of production [citation:2].

### Post-optimization (production build)

- URL: `http://localhost:4173` (served via `vite preview`)
- Report: `post-audit.json`
- Key finding: Production build removes dev-only tooling and minifies assets, resulting in a substantially higher Performance score.

### Optimizations applied

1. **Production build:** `npm run build` bundles and minifies all assets.
2. **Virtualized list:** `react-window` limits DOM nodes to visible rows, keeping rendering fast.
3. **Per-id subscriptions:** WebSocket updates only re-render the affected row via `useSyncExternalStore`, avoiding full-list re-renders.
4. **Code-splitting opportunity (future):** Leaflet is loaded eagerly; lazy-loading it would further improve initial LCP.

---

## 2. Content-Security-Policy

### Configuration

File: `netlify.toml` (or `vercel.json`)

Key directives:
- `script-src 'self'` — **blocks all inline scripts**, satisfying the Task 4 requirement.
- `object-src 'none'` — disables plugins.
- `frame-ancestors 'none'` — prevents clickjacking.
- `connect-src 'self' ws: wss:` — allows the WebSocket connection.

### Verification

After deploying to Netlify/Vercel, open DevTools → Network → any document request → Response Headers. Confirm `Content-Security-Policy` is present and `script-src` does **not** contain `'unsafe-inline'`.

---

## 3. DOMPurify Sanitization

### Where it's used

- `app.js` → `prependFeedCard()`: the dynamically built HTML string is sanitized before `innerHTML` assignment.
- React components: React escapes text by default. If any `dangerouslySetInnerHTML` is added in future, it must be wrapped with `DOMPurify.sanitize()` [citation:5].

### Configuration

```js
DOMPurify.sanitize(rawHtml, {
  ALLOWED_TAGS: ['div', 'span'],
  ALLOWED_ATTR: ['class'],
});