import { memo } from "react";
import type { ForecastDay, Units } from "../types/weather";
import {
  formatDayLabel,
  formatHourLabel,
  formatTemperature,
  formatWindSpeed,
} from "../utils/groupForecastByDay";

interface DayDetailProps {
  day: ForecastDay | null;
  units: Units;
  onClose: () => void;
}

const DayDetail = memo(({ day, units, onClose }: DayDetailProps) => {
  if (!day) return null;

  return (
    <section
      className="day-detail"
      aria-label={`Hourly forecast for ${formatDayLabel(day.date)}`}
    >
      <div className="day-detail__header">
        <h2>Hourly forecast for {formatDayLabel(day.date)}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close hourly detail"
        >
          Close
        </button>
      </div>
      <ul className="day-detail__hours">
        {day.entries.map((entry) => (
          <li key={entry.dt} className="day-detail__hour">
            <span className="day-detail__time">
              {formatHourLabel(entry.dt, day.timezoneOffset)}
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`}
              alt={entry.weather[0].description}
            />
            <span className="day-detail__temp">
              {formatTemperature(entry.main.temp, units)}
            </span>
            <span className="day-detail__description">
              {entry.weather[0].description}
            </span>
            <span className="day-detail__humidity">
              Humidity: {entry.main.humidity}%
            </span>
            <span className="day-detail__wind">
              Wind: {formatWindSpeed(entry.wind.speed, units)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
});

export default DayDetail;
