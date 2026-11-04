import { useSyncExternalStore, memo } from 'react';
import { subscribeToVehicle, getVehicle } from '../store/vehicleStore';

function VehicleRow({ vehicleId, style, focusedId, onFocusRow }) {
  // Subscribe ONLY to this vehicle's changes.
  const vehicle = useSyncExternalStore(
    (cb) => subscribeToVehicle(vehicleId, cb),
    () => getVehicle(vehicleId)
  );

  const isFocused = focusedId === vehicleId;

  if (!vehicle) return null;

  return (
    <div
      style={style}
      role="listitem"
      tabIndex={isFocused ? 0 : -1}
      aria-label={`Vehicle ${vehicle.id}, status ${vehicle.status}, region ${vehicle.region}, speed ${vehicle.speed} kilometers per hour`}
      aria-setsize={400}
      aria-posinset={Number(vehicle.id.split('-')[1])}
      onFocus={() => onFocusRow(vehicleId)}
      className={`vehicle-row ${isFocused ? 'focused' : ''}`}
    >
      <span>{vehicle.id}</span>
      <span className={`status-${vehicle.status}`}>{vehicle.status}</span>
      <span>{vehicle.region}</span>
      <span>{vehicle.speed} km/h</span>
      <span>{vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}</span>
    </div>
  );
}

export default memo(VehicleRow);