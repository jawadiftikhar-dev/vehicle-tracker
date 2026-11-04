import { List, useListRef } from 'react-window';
import { useCallback, useRef, useState, useEffect } from 'react';
import VehicleRow from './VehicleRow';
import { getAllVehicles } from '../store/vehicleStore';

const ROW_HEIGHT = 48;

export default function VirtualizedVehicleList({ vehicleIds, focusedId, onFocusRow }) {
  const listRef = useListRef();

  const Row = useCallback(
    ({ index, style }) => (
      <VehicleRow
        vehicleId={vehicleIds[index]}
        style={style}
        focusedId={focusedId}
        onFocusRow={onFocusRow}
      />
    ),
    [vehicleIds, focusedId, onFocusRow]
  );

  // Scroll focused row into view (for arrow-key navigation).
  useEffect(() => {
    if (!focusedId) return;
    const idx = vehicleIds.indexOf(focusedId);
    if (idx >= 0) listRef.current?.scrollToRow({ index: idx, align: 'smart' });
  }, [focusedId, vehicleIds, listRef]);

  return (
    <div role="list" aria-label={`Vehicle list, ${vehicleIds.length} items`}>
      <List
        listRef={listRef}
        rowCount={vehicleIds.length}
        rowHeight={ROW_HEIGHT}
        rowComponent={Row}
        overscanCount={5}
        style={{ height: 600 }}
      />
    </div>
  );
}