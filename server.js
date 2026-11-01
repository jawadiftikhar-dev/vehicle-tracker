// server.js
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { generateVehicles } from './scripts/generateVehicles.js';

const PORT = 4000;
const app = express();

// 400 generated vehicle records served from memory.
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
  // Send a small snapshot so new clients see data immediately.
  ws.send(JSON.stringify({ type: 'snapshot', count: vehicles.length }));
  ws.on('close', () => console.log('[ws] client disconnected'));
});

// Broadcast a random position update every 5 seconds.
setInterval(() => {
  const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

  // Nudge the position slightly for realism (≈ ±0.001°, ~100m).
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
    if (client.readyState === 1 /* OPEN */) {
      client.send(message);
    }
  }
}, 5000);

server.listen(PORT, () => {
  console.log(`REST:      http://localhost:${PORT}/api/vehicles`);
  console.log(`WebSocket: ws://localhost:${PORT}/positions`);
});