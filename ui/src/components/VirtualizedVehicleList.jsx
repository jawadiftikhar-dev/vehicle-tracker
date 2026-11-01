import { List, useListRef } from 'react-window'
import { useRef, useCallback } from 'react'

const ROW_HEIGHT = 48

function VehicleRow({ index, style, vehicles, focusedIndex, onFocusRow }) {
  const v = vehicles[index]
  const isFocused = focusedIndex === index

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      onFocusRow(e.key === 'ArrowDown' ? index + 1 : index - 1)
    }
  }

  return (
    <div
      style={style}
      role="listitem"
      tabIndex={isFocused ? 0 : -1}
      aria-label={`Vehicle ${v.id}, status ${v.status}, region ${v.region}, speed ${v.speed} kilometers per hour`}
      aria-setsize={vehicles.length}
      aria-posinset={index + 1}
      onKeyDown={handleKeyDown}
      onFocus={() => onFocusRow(index)}
      className={`vehicle-row ${isFocused ? 'focused' : ''}`}
    >
      <span className="cell id">{v.id}</span>
      <span className={`cell status status-${v.status}`}>{v.status}</span>
      <span className="cell region">{v.region}</span>
      <span className="cell speed">{v.speed} km/h</span>
      <span className="cell coords">{v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span>
    </div>
  )
}

export default function VirtualizedVehicleList({ vehicles }) {
  const listRef = useListRef()
  const focusedIndexRef = useRef(0)
  const [, forceRender] = useReducer((x) => x + 1, 0)

  const setFocusedIndex = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(vehicles.length - 1, idx))
    focusedIndexRef.current = clamped
    forceRender()
    listRef.current?.scrollToRow({ index: clamped, align: 'smart' })
  }, [vehicles.length, listRef])

  if (vehicles.length === 0) {
    return <div className="empty-state">No vehicles match the current filters.</div>
  }

  return (
    <div
      role="list"
      aria-label={`Vehicle list, ${vehicles.length} items`}
      className="vehicle-list-container"
    >
      <List
        listRef={listRef}
        rowCount={vehicles.length}
        rowHeight={ROW_HEIGHT}
        rowProps={{
          vehicles,
          focusedIndex: focusedIndexRef.current,
          onFocusRow: setFocusedIndex,
        }}
        rowComponent={VehicleRow}
        overscanCount={5}
        style={{ height: 600 }}
      />
    </div>
  )
}