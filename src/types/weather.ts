export type Units = 'metric' | 'imperial'

export interface WeatherCondition {
  description: string
  icon: string
}

export interface ForecastEntry {
  dt: number
  dt_txt: string
  main: {
    temp: number
    temp_min: number
    temp_max: number
    humidity: number
  }
  weather: WeatherCondition[]
  wind: {
    speed: number
  }
}

export interface ForecastApiResponse {
  city: {
    name: string
    country: string
  }
  list: ForecastEntry[]
}

export interface ForecastDay {
  date: string
  entries: ForecastEntry[]
  minTemp: number
  maxTemp: number
  avgTemp: number
  description: string
  icon: string
}
