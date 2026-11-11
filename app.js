const el = (id) => document.getElementById(id);

// ---------- Offline banner ----------
function ensureOfflineBanner() {
  let banner = document.getElementById('offline-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    banner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0;
      background: #b91c1c; color: #fff;
      padding: 10px 16px; text-align: center;
      font-size: 14px; font-weight: 500;
      z-index: 9999; display: none;
    `;
    banner.textContent =
      'Live updates disconnected. Data may be stale until the connection recovers.';
    document.body.appendChild(banner);
  }
  return banner;
}

function showOfflineBanner() {
  ensureOfflineBanner().style.display = 'block';
}

function hideOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'none';
}

// ---------- REST: fleet summary ----------
async function loadStats() {
  try {
    const res = await fetch('/api/vehicles');
    const vehicles = await res.json();

    const counts = vehicles.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {});

    const setText = (id, value) => {
      const node = el(id);
      if (node) node.textContent = value;
    };

    setText('stat-total', vehicles.length);
    setText('stat-active', counts.active || 0);
    setText('stat-idle', counts.idle || 0);
    setText('stat-maint', counts.maintenance || 0);
    setText('metric-vehicles', vehicles.length);
    setText('metric-active', counts.active || 0);
  } catch (err) {
    console.error('Failed to load stats', err);
  }
}

// ---------- WebSocket: live feed ----------
let updateCount = 0;

function connectWs() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${proto}://${location.host}/positions`);
  const status = el('ws-status');

  ws.addEventListener('open', () => {
    if (status) {
      status.textContent = 'Connected';
      status.className = 'pill ok';
    }
    hideOfflineBanner();
  });

  ws.addEventListener('close', () => {
    if (status) {
      status.textContent = 'Reconnecting…';
      status.className = 'pill err';
    }
    showOfflineBanner();
    setTimeout(connectWs, 3000);
  });

  ws.addEventListener('error', () => {
    if (status) {
      status.textContent = 'Connection error';
      status.className = 'pill err';
    }
    showOfflineBanner();
  });

  ws.addEventListener('message', (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (data.type !== 'position') return;

    updateCount += 1;
    const metric = el('metric-updates');
    if (metric) metric.textContent = updateCount;

    prependFeedCard(data);
  });
}

function prependFeedCard({ vehicle }) {
  const feed = el('feed');
  if (!feed) return;

  const empty = feed.querySelector('.feed-empty');
  if (empty) empty.remove();

  const card = document.createElement('div');
  card.className = 'feed-card';

  // Build raw HTML string first
  const rawHtml = `
    <div class="feed-card-head">
      <span class="feed-card-id">${vehicle.id}</span>
      <span class="feed-card-status ${vehicle.status}">${vehicle.status}</span>
    </div>
    <div class="feed-card-meta">
      ${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)} · ${vehicle.speed} km/h
    </div>
  `;

  // Sanitize all dynamic HTML before insertion (Task 4 requirement)
  card.innerHTML = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['div', 'span'],
    ALLOWED_ATTR: ['class'],
  });

  feed.prepend(card);
  while (feed.children.length > 12) feed.lastElementChild.remove();
}

// ---------- Init ----------
const yearEl = el('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

loadStats();
connectWs();