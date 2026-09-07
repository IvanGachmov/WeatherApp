import { memo } from "react";
import type { ForecastDay, Units } from "../types/weather";
import { formatDayLabel, formatTemperature } from "../utils/groupForecastByDay";

interface ForecastCardProps {
  day: ForecastDay;
  units: Units;
  isSelected: boolean;
  onSelect: (date: string) => void;
}

const ForecastCard = memo(
  ({ day, units, isSelected, onSelect }: ForecastCardProps) => {
    return (
      <button
        type="button"
        className={`forecast-card${isSelected ? " forecast-card--selected" : ""}`}
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
            {formatTemperature(day.maxTemp, units)}
          </span>
          <span className="forecast-card__min">
            {formatTemperature(day.minTemp, units)}
          </span>
        </div>
      </button>
    );
  },
);

export default ForecastCard;
