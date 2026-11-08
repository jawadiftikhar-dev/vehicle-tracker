// Parses and validates a raw vehicle object from the API.
export function parseVehicle(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid vehicle data: expected an object');
  }

  const required = ['id', 'status', 'lat', 'lng', 'speed', 'region'];
  for (const field of required) {
    if (raw[field] === undefined || raw[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const validStatuses = ['active', 'idle', 'maintenance', 'offline'];
  if (!validStatuses.includes(raw.status)) {
    throw new Error(`Invalid status: ${raw.status}`);
  }

  return {
    id: String(raw.id),
    status: raw.status,
    lat: Number(raw.lat),
    lng: Number(raw.lng),
    speed: Number(raw.speed),
    region: String(raw.region),
  };
}

// Applies a WebSocket position update to an existing vehicle.
export function applyPositionUpdate(vehicle, update) {
  if (!vehicle || !update) {
    throw new Error('Both vehicle and update are required');
  }
  return {
    ...vehicle,
    lat: Number(update.lat),
    lng: Number(update.lng),
    speed: Number(update.speed),
    status: update.status ?? vehicle.status,
  };
}