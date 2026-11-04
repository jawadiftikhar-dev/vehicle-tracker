import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchVehicles } from './services/vehicles';
import { initVehicles, getAllVehicles } from './store/vehicleStore';
import { useVehicleSocket } from './hooks/useVehicleSocket';
import VirtualizedVehicleList from './components/VirtualizedVehicleList';
import MapPanel from './components/MapPanel';
import OfflineBanner from './components/OfflineBanner';
import FilterBar from './components/FilterBar';

export default function App() {
  const [searchParams] = useSearchParams();
  const [focusedId, setFocusedId] = useState(null);
  const [ready, setReady] = useState(false);
  const { offline } = useVehicleSocket();

  useEffect(() => {
    fetchVehicles().then((data) => {
      initVehicles(data);
      setReady(true);
    });
  }, []);

  const status = searchParams.get('status') || '';
  const region = searchParams.get('region') || '';

  // Filtered ids — recomputed only when filters change (not on WS updates).
  const filteredIds = useMemo(() => {
    return getAllVehicles()
      .filter((v) => (!status || v.status === status) && (!region || v.region === region))
      .map((v) => v.id);
  }, [status, region, ready]);

  const handleFocus = useCallback((id) => setFocusedId(id), []);

  if (!ready) return <div>Loading…</div>;

  return (
    <div className="app">
      <OfflineBanner offline={offline} />
      <h1>Fleet Tracker</h1>
      <FilterBar />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <VirtualizedVehicleList
          vehicleIds={filteredIds}
          focusedId={focusedId}
          onFocusRow={handleFocus}
        />
        <MapPanel focusedId={focusedId} />
      </div>
    </div>
  );
}