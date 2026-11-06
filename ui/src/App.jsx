import { useEffect, useState, useMemo, useCallback } from 'react';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import { fetchVehicles } from './services/vehicles';
import {
  initVehicles,
  getAllVehicles,
  updateVehicle,
} from './store/vehicleStore';
import FilterBar from './components/FilterBar';
import VirtualizedVehicleList from './components/VirtualizedVehicleList';
import MapPanel from './components/MapPanel';
import OfflineBanner from './components/OfflineBanner';

function VehicleDashboard() {
  const [searchParams] = useSearchParams();
  const [focusedId, setFocusedId] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  // ---- 1. Load initial data from REST and populate the external store ----
  useEffect(() => {
    let cancelled = false;
    fetchVehicles()
      .then((data) => {
        if (cancelled) return;
        initVehicles(data); // fills store, not React state
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- 2. Open WebSocket and push each update into the store ----
  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/positions`);

    ws.onopen = () => setOffline(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'position' && data.vehicle) {
          // Fires only the listener for data.vehicle.id.
          updateVehicle(data.vehicle);
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => setOffline(true);
    ws.onerror = () => setOffline(true);

    return () => ws.close();
  }, []);

  // ---- 3. Filters come from the URL and only affect which IDs render ----
  const status = searchParams.get('status') || '';
  const region = searchParams.get('region') || '';

  // Recompute the visible id list only when filters change.
  const filteredIds = useMemo(() => {
    if (!ready) return [];
    return getAllVehicles()
      .filter(
        (v) =>
          (!status || v.status === status) &&
          (!region || v.region === region)
      )
      .map((v) => v.id);
  }, [status, region, ready]);

  const handleFocusRow = useCallback((id) => {
    setFocusedId(id);
  }, []);

  if (error) {
    return (
      <div className="app">
        <OfflineBanner offline={offline} />
        <p style={{ color: '#b91c1c' }}>Error: {error.message}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="app">
        <OfflineBanner offline={offline} />
        <p>Loading vehicles…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <OfflineBanner offline={offline} />
      <h1>Fleet Tracker</h1>
      <FilterBar />
      <p className="result-count">
        {filteredIds.length} vehicle{filteredIds.length !== 1 ? 's' : ''}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <VirtualizedVehicleList
          vehicleIds={filteredIds}
          focusedId={focusedId}
          onFocusRow={handleFocusRow}
        />
        <MapPanel focusedId={focusedId} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <VehicleDashboard />
    </BrowserRouter>
  );
}