// ui/src/hooks/useVehicleSocket.js
import { useEffect, useState } from 'react';
import { updateVehicle } from '../store/vehicleStore';

export function useVehicleSocket() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/positions`);

    ws.onopen = () => setOffline(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'position' && data.vehicle) {
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

  return { offline };
}