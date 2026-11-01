// server.js
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { generateVehicles } from './scripts/generateVehicles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4000;
const app = express();

// Serve the landing page from /public
app.use(express.static(path.join(__dirname, 'public')));

const vehicles = generateVehicles(400);
const vehiclesById = new Map(vehicles.map(v => [v.id, v]));

// --- REST API ---
app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

// --- HTTP + WebSocket server ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/positions' });

wss.on('connection', (ws) => {
  console.log('[ws] client connected');
  ws.send(JSON.stringify({ type: 'snapshot', count: vehicles.length }));
  ws.on('close', () => console.log('[ws] client disconnected'));
});

setInterval(() => {
  const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

  vehicle.lat = Number((vehicle.lat + (Math.random() - 0.5) * 0.002).toFixed(6));
  vehicle.lng = Number((vehicle.lng + (Math.random() - 0.5) * 0.002).toFixed(6));
  if (vehicle.status === 'active') {
    vehicle.speed = Number(
      Math.max(0, Math.min(140, vehicle.speed + (Math.random() - 0.5) * 10)).toFixed(1)
    );
  }

  const message = JSON.stringify({
    type: 'position',
    timestamp: new Date().toISOString(),
    vehicle: vehiclesById.get(vehicle.id),
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message);
  }
}, 5000);

server.listen(PORT, () => {
  console.log(`Landing page: http://localhost:${PORT}/`);
  console.log(`REST:         http://localhost:${PORT}/api/vehicles`);
  console.log(`WebSocket:    ws://localhost:${PORT}/positions`);
});