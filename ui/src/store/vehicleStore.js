const vehicles = new Map();          // id -> vehicle object
const listeners = new Map();         // id -> Set<callback>
const globalListeners = new Set();   // notified on any change (for map/banner)

// Initialize from the REST fetch.
export function initVehicles(list) {
  list.forEach((v) => vehicles.set(v.id, v));
  notifyGlobal();
}

export function getVehicle(id) {
  return vehicles.get(id);
}

export function getAllVehicles() {
  return Array.from(vehicles.values());
}

// Called by the WebSocket when a position update arrives.
export function updateVehicle(vehicle) {
  vehicles.set(vehicle.id, { ...vehicle });
  notifyRow(vehicle.id);
  notifyGlobal();
}

function notifyRow(id) {
  const set = listeners.get(id);
  if (set) set.forEach((fn) => fn());
}

function notifyGlobal() {
  globalListeners.forEach((fn) => fn());
}

// Per-row subscription. Returns unsubscribe.
export function subscribeToVehicle(id, callback) {
  if (!listeners.has(id)) listeners.set(id, new Set());
  listeners.get(id).add(callback);
  return () => listeners.get(id)?.delete(callback);
}

// Global subscription (map, banner, counts).
export function subscribeGlobal(callback) {
  globalListeners.add(callback);
  return () => globalListeners.delete(callback);
}