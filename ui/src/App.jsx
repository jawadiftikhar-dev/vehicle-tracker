import { useEffect, useState, useMemo } from 'react'
import { BrowserRouter, useSearchParams } from 'react-router-dom'
import { fetchVehicles } from './services/vehicles'
import FilterBar from './components/FilterBar'
import VirtualizedVehicleList from './components/VirtualizedVehicleList'

function VehicleDashboard() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchVehicles()
      .then(setVehicles)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const status = searchParams.get('status') || ''
  const region = searchParams.get('region') || ''

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (status && v.status !== status) return false
      if (region && v.region !== region) return false
      return true
    })
  }, [vehicles, status, region])

  if (loading) return <div className="loading">Loading vehicles…</div>
  if (error) return <div className="error">Error: {error.message}</div>

  return (
    <div className="app">
      <h1>Fleet Tracker</h1>
      <FilterBar />
      <p className="result-count">
        {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}
      </p>
      <VirtualizedVehicleList vehicles={filtered} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <VehicleDashboard />
    </BrowserRouter>
  )
}