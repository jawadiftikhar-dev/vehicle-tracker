import { useSearchParams } from 'react-router-dom'

const STATUSES = ['', 'active', 'idle', 'maintenance', 'offline']
const REGIONS = ['', 'North', 'South', 'East', 'West', 'Central']

export default function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams()

  const status = searchParams.get('status') || ''
  const region = searchParams.get('region') || ''

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="filter-bar" role="search" aria-label="Filter vehicles">
      <label>
        Status
        <select
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'All'}</option>
          ))}
        </select>
      </label>
      <label>
        Region
        <select
          value={region}
          onChange={(e) => updateFilter('region', e.target.value)}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r || 'All'}</option>
          ))}
        </select>
      </label>
    </div>
  )
}