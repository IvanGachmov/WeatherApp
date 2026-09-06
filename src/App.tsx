import { useCallback, useState } from 'react'
import SearchBar from './components/SearchBar'
import GeolocationButton from './components/GeolocationButton'
import ForecastList from './components/ForecastList'
import DayDetail from './components/DayDetail'
import ErrorMessage from './components/ErrorMessage'
import LoadingSpinner from './components/LoadingSpinner'
import { fetchForecastByCity, fetchForecastByCoords } from './api/weatherApi'
import { groupForecastByDay } from './utils/groupForecastByDay'
import type { ForecastApiResponse, ForecastDay, Units } from './types/weather'

type Query = { type: 'city'; city: string } | { type: 'coords'; lat: number; lon: number }

export default function App() {
  const [days, setDays] = useState<ForecastDay[]>([])
  const [cityLabel, setCityLabel] = useState('')
  const [units, setUnits] = useState<Units>('metric')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Remembers the last successful query so we can re-run it if the
  // user switches units (metric/imperial) after already loading data.
  const [lastQuery, setLastQuery] = useState<Query | null>(null)

  const applyForecastResponse = useCallback((data: ForecastApiResponse) => {
    const grouped = groupForecastByDay(data.list)
    setDays(grouped)
    setCityLabel(`${data.city.name}${data.city.country ? ', ' + data.city.country : ''}`)
    setSelectedDate(grouped.length > 0 ? grouped[0].date : null)
  }, [])

  const runQuery = useCallback(
    async (query: Query, queryUnits: Units) => {
      setLoading(true)
      setError(null)
      try {
        const data =
          query.type === 'city'
            ? await fetchForecastByCity(query.city, queryUnits)
            : await fetchForecastByCoords(query.lat, query.lon, queryUnits)
        applyForecastResponse(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
        setDays([])
      } finally {
        setLoading(false)
      }
    },
    [applyForecastResponse]
  )

  const handleSearch = useCallback(
    (city: string) => {
      const query: Query = { type: 'city', city }
      setLastQuery(query)
      void runQuery(query, units)
    },
    [runQuery, units]
  )

  const handleLocate = useCallback(
    (coords: { lat: number; lon: number } | null, locateError: Error | null) => {
      if (locateError || !coords) {
        setError(locateError?.message ?? 'Unable to retrieve your location.')
        return
      }
      const query: Query = { type: 'coords', lat: coords.lat, lon: coords.lon }
      setLastQuery(query)
      void runQuery(query, units)
    },
    [runQuery, units]
  )

  function handleUnitsChange(nextUnits: Units) {
    setUnits(nextUnits)
    if (lastQuery) {
      void runQuery(lastQuery, nextUnits)
    }
  }

  const selectedDay = days.find((d) => d.date === selectedDate) || null

  return (
    <main className="app">
      <h1>5-Day Weather Forecast</h1>

      <div className="app__controls">
        <SearchBar onSearch={handleSearch} disabled={loading} />
        <GeolocationButton onLocate={handleLocate} disabled={loading} />
        <label className="app__units">
          Units:
          <select
            value={units}
            onChange={(e) => handleUnitsChange(e.target.value as Units)}
            disabled={loading}
          >
            <option value="metric">Celsius</option>
            <option value="imperial">Fahrenheit</option>
          </select>
        </label>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingSpinner />}

      {cityLabel && !loading && <h2 className="app__city">{cityLabel}</h2>}

      <ForecastList
        days={days}
        units={units}
        selectedDate={selectedDate}
        onSelectDay={setSelectedDate}
      />

      {selectedDay && (
        <DayDetail day={selectedDay} units={units} onClose={() => setSelectedDate(null)} />
      )}
    </main>
  )
}
