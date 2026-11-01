const el = (id) => document.getElementById(id);

// ---------- REST: fleet summary ----------
async function loadStats() {
  try {
    const res = await fetch('/api/vehicles');
    const vehicles = await res.json();

    const counts = vehicles.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {});

    el('stat-total').textContent = vehicles.length;
    el('stat-active').textContent = counts.active || 0;
    el('stat-idle').textContent = counts.idle || 0;
    el('stat-maint').textContent = counts.maintenance || 0;

    el('metric-vehicles').textContent = vehicles.length;
    el('metric-active').textContent = counts.active || 0;
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
    status.textContent = 'Connected';
    status.className = 'pill ok';
  });

  ws.addEventListener('close', () => {
    status.textContent = 'Reconnecting…';
    status.className = 'pill err';
    setTimeout(connectWs, 3000);
  });

  ws.addEventListener('error', () => {
    status.textContent = 'Connection error';
    status.className = 'pill err';
  });

  ws.addEventListener('message', (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (data.type !== 'position') return;

    updateCount += 1;
    el('metric-updates').textContent = updateCount;

    prependFeedCard(data);
  });
}

function prependFeedCard({ vehicle, timestamp }) {
  const feed = el('feed');
  const empty = feed.querySelector('.feed-empty');
  if (empty) empty.remove();

  const card = document.createElement('div');
  card.className = 'feed-card';
  card.innerHTML = `
    <div class="feed-card-head">
      <span class="feed-card-id">${vehicle.id}</span>
      <span class="feed-card-status ${vehicle.status}">${vehicle.status}</span>
    </div>
    <div class="feed-card-meta">
      ${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)} · ${vehicle.speed} km/h
    </div>
  `;

  feed.prepend(card);
  // Keep only the latest 12 cards.
  while (feed.children.length > 12) feed.lastElementChild.remove();
}

// ---------- Init ----------
el('year').textContent = new Date().getFullYear();
loadStats();
connectWs();