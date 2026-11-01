const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function fetchVehicles() {
  const res = await fetch(`${API_BASE}/api/vehicles`)
  if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.status}`)
  return res.json()
}