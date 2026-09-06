import React from "react";
import ForecastCard from "./ForecastCard";
import type { ForecastDay, Units } from "../types/weather";

interface ForecastListProps {
  days: ForecastDay[];
  units: Units;
  selectedDate: string | null;
  onSelectDay: (date: string) => void;
}

const ForecastList = React.memo(
  ({ days, units, selectedDate, onSelectDay }: ForecastListProps) => {
    if (!days || days.length === 0) return null;

    return (
      <div className="forecast-list" role="list">
        {days.map((day) => (
          <div role="listitem" key={day.date}>
            <ForecastCard
              day={day}
              units={units}
              isSelected={day.date === selectedDate}
              onSelect={onSelectDay}
            />
          </div>
        ))}
      </div>
    );
  },
);

export default ForecastList;
