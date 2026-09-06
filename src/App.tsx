import SearchBar from './components/SearchBar'
import GeolocationButton from './components/GeolocationButton'
import ForecastList from './components/ForecastList'
import DayDetail from './components/DayDetail'
import ErrorMessage from './components/ErrorMessage'
import LoadingSpinner from './components/LoadingSpinner'
import useWeatherForcast from './hooks/useWeatherForcast'
import type { Units } from './types/weather'

export default function App() {
  const {
    days,
    cityLabel,
    units,
    selectedDate,
    loading,
    error,
    setSelectedDate,
    searchCity,
    loadByCoords,
    changeUnits,
  } = useWeatherForcast()

  const selectedDay = days.find((d) => d.date === selectedDate) || null

  return (
    <main className="app">
      <h1>5-Day Weather Forecast</h1>

      <div className="app__controls">
        <SearchBar onSearch={searchCity} disabled={loading} />
        <GeolocationButton onLocate={loadByCoords} disabled={loading} />
        <label className="app__units">
          Units:
          <select
            value={units}
            onChange={(e) => changeUnits(e.target.value as Units)}
            disabled={loading}
          >
            <option value="metric">Celsius</option>
            <option value="imperial">Fahrenheit</option>
            <option value="kelvin">Kelvin</option>
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
