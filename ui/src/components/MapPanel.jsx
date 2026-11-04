import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSyncExternalStore, useMemo } from 'react';
import { subscribeGlobal, getAllVehicles, getVehicle } from '../store/vehicleStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path (Vite bundling issue).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Distinct icon for the focused vehicle.
const focusedIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  className: 'focused-marker',
});

export default function MapPanel({ focusedId }) {
  // Re-render map markers whenever any vehicle changes.
  useSyncExternalStore(subscribeGlobal, getAllVehicles);

  // Render markers for the focused vehicle + a few around it.
  const markerIds = useMemo(() => {
    const all = getAllVehicles().map((v) => v.id);
    if (!focusedId) return all.slice(0, 20); // first 20 as default
    const idx = all.indexOf(focusedId);
    const start = Math.max(0, idx - 5);
    return all.slice(start, start + 10);
  }, [focusedId]);

  const focused = focusedId ? getVehicle(focusedId) : null;

  return (
    <MapContainer
      center={[40, 0]}
      zoom={4}
      style={{ height: 400, width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markerIds.map((id) => {
        const v = getVehicle(id);
        if (!v) return null;
        return (
          <Marker
            key={id}
            position={[v.lat, v.lng]}
            icon={id === focusedId ? focusedIcon : undefined}
            zIndexOffset={id === focusedId ? 1000 : 0}
          >
            <Popup>{v.id} — {v.status}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}