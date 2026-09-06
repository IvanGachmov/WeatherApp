import type { ForecastDay, Units } from '../types/weather'
import { formatDayLabel, formatHourLabel,formatTemperature } from '../utils/groupForecastByDay'

interface DayDetailProps {
  day: ForecastDay | null
  units: Units
  onClose: () => void
}

export default function DayDetail({ day, units, onClose }: DayDetailProps) {
  if (!day) return null
  const windUnit = units === 'imperial' ? 'mph' : 'm/s'

  return (
    <section
      className="day-detail"
      aria-label={`Hourly forecast for ${formatDayLabel(day.date)}`}
    >
      <div className="day-detail__header">
        <h2>Hourly forecast for {formatDayLabel(day.date)}</h2>
        <button type="button" onClick={onClose} aria-label="Close hourly detail">
          Close
        </button>
      </div>
      <ul className="day-detail__hours">
        {day.entries.map((entry) => (
          <li key={entry.dt} className="day-detail__hour">
            <span className="day-detail__time">{formatHourLabel(entry.dt_txt)}</span>
            <img
              src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`}
              alt={entry.weather[0].description}
            />
            <span className="day-detail__temp">
              {formatTemperature(entry.main.temp,units)}
            </span>
            <span className="day-detail__description">{entry.weather[0].description}</span>
            <span className="day-detail__humidity">Humidity: {entry.main.humidity}%</span>
            <span className="day-detail__wind">
              Wind: {Math.round(entry.wind.speed)} {windUnit}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
