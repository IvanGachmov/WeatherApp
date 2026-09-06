import type { ForecastDay, Units } from '../types/weather'
import { formatDayLabel } from '../utils/groupForecastByDay'

interface ForecastCardProps {
  day: ForecastDay
  units: Units
  isSelected: boolean
  onSelect: (date: string) => void
}

export default function ForecastCard({ day, units, isSelected, onSelect }: ForecastCardProps) {
  const unitLabel = units === 'imperial' ? '°F' : '°C'

  return (
    <button
      type="button"
      className={`forecast-card${isSelected ? ' forecast-card--selected' : ''}`}
      onClick={() => onSelect(day.date)}
      aria-pressed={isSelected}
    >
      <div className="forecast-card__day">{formatDayLabel(day.date)}</div>
      <img
        className="forecast-card__icon"
        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
        alt={day.description}
      />
      <div className="forecast-card__description">{day.description}</div>
      <div className="forecast-card__temps">
        <span className="forecast-card__max">
          {Math.round(day.maxTemp)}
          {unitLabel}
        </span>
        <span className="forecast-card__min">
          {Math.round(day.minTemp)}
          {unitLabel}
        </span>
      </div>
    </button>
  )
}
