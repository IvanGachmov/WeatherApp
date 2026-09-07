import type { ForecastDay, ForecastEntry } from "../types/weather";

/**
 * The OpenWeatherMap 5-day forecast endpoint returns data in 3-hour
 * intervals (up to 40 entries). This groups those entries by calendar
 * day and derives summary stats (min/max temp, a representative icon
 * and description) for each day.
 */
function getCityTimestamp(entry: ForecastEntry, timezoneOffset: number): number {
  return entry.dt * 1000 + timezoneOffset * 1000;
}

function getCityDate(entry: ForecastEntry, timezoneOffset: number): string {
  return new Date(getCityTimestamp(entry, timezoneOffset))
    .toISOString()
    .slice(0, 10);
}

function getCityHour(entry: ForecastEntry, timezoneOffset: number): number {
  return new Date(getCityTimestamp(entry, timezoneOffset)).getUTCHours();
}

export function groupForecastByDay(
  list: ForecastEntry[] = [],
  timezoneOffset = 0,
): ForecastDay[] {
  const byDate = new Map<string, ForecastEntry[]>();

  list.forEach((entry) => {
    const date = getCityDate(entry, timezoneOffset);
    if (!byDate.has(date)) {
      byDate.set(date, []);
    }
    byDate.get(date)!.push(entry);
  });

  const days: ForecastDay[] = Array.from(byDate.entries()).map(
    ([date, entries]) => {
      const temps = entries.map((e) => e.main.temp);
      const minTemp = Math.min(...entries.map((e) => e.main.temp_min));
      const maxTemp = Math.max(...entries.map((e) => e.main.temp_max));

      // Prefer the midday (12:00) reading as representative of the day;
      // otherwise fall back to the middle entry.
      const midday = entries.find((e) => getCityHour(e, timezoneOffset) === 12);
      const representative = midday || entries[Math.floor(entries.length / 2)];

      return {
        date,
        entries,
        minTemp,
        maxTemp,
        avgTemp: temps.reduce((sum, t) => sum + t, 0) / temps.length,
        description: representative.weather[0].description,
        icon: representative.weather[0].icon,
        timezoneOffset,
      };
    },
  );

  // The API's first/last day at the query boundary can be a partial
  // day; cap the display at 5 days as the assignment specifies.
  return days.slice(0, 5);
}

export function formatDayLabel(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatHourLabel(dt: number, timezoneOffset = 0): string {
  const date = new Date(dt * 1000 + timezoneOffset * 1000);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatTemperature(
  temp: number,
  units: "metric" | "imperial" | "kelvin",
): string {
  if (units === "metric") {
    return `${Math.round(temp - 273.15)}°C`;
  } else if (units === "imperial") {
    return `${Math.round(((temp - 273.15) * 9) / 5 + 32)}°F`;
  } else {
    return `${Math.round(temp)}K`;
  }
}

export function formatWindSpeed(
  speed: number,
  units: "metric" | "imperial" | "kelvin",
): string {
  if (units === "imperial") {
    return `${Math.round(speed * 2.23694)} mph`;
  } else {
    return `${Math.round(speed)} m/s`;
  }
}
