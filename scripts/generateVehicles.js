// scripts/generateVehicles.js
// Generates 400 realistic vehicle records for the fleet.

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const STATUSES = ['active', 'idle', 'maintenance', 'offline'];

// Rough bounding boxes per region (lat/lng pairs) for realistic spread.
const REGION_BOUNDS = {
  North:   { lat: [45.0, 55.0], lng: [-10.0, 10.0] },
  South:   { lat: [25.0, 35.0], lng: [-10.0, 10.0] },
  East:    { lat: [35.0, 45.0], lng: [20.0, 40.0] },
  West:    { lat: [35.0, 45.0], lng: [-40.0, -20.0] },
  Central: { lat: [38.0, 42.0], lng: [-5.0, 5.0] },
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateVehicles(count = 400) {
  const vehicles = [];
  for (let i = 1; i <= count; i++) {
    const region = pick(REGIONS);
    const bounds = REGION_BOUNDS[region];
    const status = pick(STATUSES);
    // Idle/offline vehicles have low speed, active ones have higher speeds.
    const speed =
      status === 'active' ? rand(20, 120) :
      status === 'idle'   ? rand(0, 5)   :
      status === 'maintenance' ? 0      : 0;

    vehicles.push({
      id: `VH-${String(i).padStart(4, '0')}`,
      status,
      lat: Number(rand(bounds.lat[0], bounds.lat[1]).toFixed(6)),
      lng: Number(rand(bounds.lng[0], bounds.lng[1]).toFixed(6)),
      speed: Number(speed.toFixed(1)), // km/h
      region,
    });
  }
  return vehicles;
}

// Allow running directly: `node scripts/generateVehicles.js > vehicles.json`
if (import.meta.url === `file://${process.argv[1]}`) {
  const data = generateVehicles(400);
  console.log(JSON.stringify(data, null, 2));
}