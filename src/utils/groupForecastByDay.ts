import type { ForecastDay, ForecastEntry } from '../types/weather'

/**
 * The OpenWeatherMap 5-day forecast endpoint returns data in 3-hour
 * intervals (up to 40 entries). This groups those entries by calendar
 * day and derives summary stats (min/max temp, a representative icon
 * and description) for each day.
 */
export function groupForecastByDay(list: ForecastEntry[] = []): ForecastDay[] {
  const byDate = new Map<string, ForecastEntry[]>()

  list.forEach((entry) => {
    const date = entry.dt_txt.split(' ')[0]
    if (!byDate.has(date)) {
      byDate.set(date, [])
    }
    byDate.get(date)!.push(entry)
  })

  const days: ForecastDay[] = Array.from(byDate.entries()).map(([date, entries]) => {
    const temps = entries.map((e) => e.main.temp)
    const minTemp = Math.min(...entries.map((e) => e.main.temp_min))
    const maxTemp = Math.max(...entries.map((e) => e.main.temp_max))

    // Prefer the midday (12:00) reading as representative of the day;
    // otherwise fall back to the middle entry.
    const midday = entries.find((e) => e.dt_txt.includes('12:00:00'))
    const representative = midday || entries[Math.floor(entries.length / 2)]

    return {
      date,
      entries,
      minTemp,
      maxTemp,
      avgTemp: temps.reduce((sum, t) => sum + t, 0) / temps.length,
      description: representative.weather[0].description,
      icon: representative.weather[0].icon,
    }
  })

  // The API's first/last day at the query boundary can be a partial
  // day; cap the display at 5 days as the assignment specifies.
  return days.slice(0, 5)
}

export function formatDayLabel(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatHourLabel(dtText: string): string {
  const date = new Date(dtText.replace(' ', 'T'))
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTemperature(temp: number, units: 'metric' | 'imperial' | 'kelvin'): string {
  if(units === 'metric'){
    return `${Math.round(temp -273.15)}°C`
  }else if(units === 'imperial'){
    return `${Math.round((temp - 273.15) * 9/5 + 32)}°F`
  }else{
    return `${Math.round(temp)}K`
  }
}