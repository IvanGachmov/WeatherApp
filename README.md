# 5-Day Weather Forecast

A React + TypeScript web app (Vite) that shows a 5-day weather forecast
using the
[OpenWeatherMap 5-day/3-hour forecast API](http://openweathermap.org/forecast5).

## Features

- **Geolocation**: "Use my location" fetches the forecast for the browser's current position.
- **City search**: enter any city name to load its forecast.
- **5-day overview**: one card per day with a min/max temperature and conditions icon.
- **Hourly drill-down**: click a day to see the 3-hour interval breakdown (temp, description, humidity, wind).
- **Units toggle**: switch between Celsius and Fahrenheit; the current view re-fetches automatically.
- Loading and error states, with the error message showing the API's own message when available.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Get a free API key at https://openweathermap.org/api
3. Copy `.env.example` to `.env` and add your key:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_OWM_API_KEY=your_api_key_here
   ```
4. Run the app:

   ```bash
   npm run dev
   ```

   Then open the printed local URL in your browser.

   Note: a fresh OpenWeatherMap API key can take a few minutes (sometimes longer) to activate.

## Tests

```bash
npm test
```

Runs the Jest suite once. Use `npm run test:watch` for watch mode.

Coverage includes:

- `groupForecastByDay` — the core transformation of the raw 40-entry, 3-hour
  API list into 5 daily summaries (grouping, min/max temps, representative
  icon/description, edge cases like empty input).
- `SearchBar` — submits trimmed input, ignores empty submissions, respects
  the disabled state.
- `ForecastList` — renders one card per day, forwards selection, renders
  nothing when empty.
- `App` — integration tests with the API module mocked: successful search,
  coordinate lookup, error display, drilling into a day's hourly detail,
  timezone-aware times, and changing units without another request.

## Project structure

```
src/
  main.tsx                     Vite entry point
  App.tsx                      top-level layout and orchestration
  hooks/useWeatherForecast.ts  forecast state and request orchestration
  types/weather.ts             shared TypeScript types for the forecast domain
  api/weatherApi.ts            typed fetch wrappers for the OpenWeatherMap endpoint
  utils/groupForecastByDay.ts  pure transform: raw API list -> daily summaries
  components/
    SearchBar.tsx
    GeolocationButton.tsx
    ForecastCard.tsx
    ForecastList.tsx
    DayDetail.tsx               hourly drill-down for the selected day
    ErrorMessage.tsx
    LoadingSpinner.tsx
```

Forecast state (data, units, loading/error, selected day) lives in
`useWeatherForecast` and flows down to components as
typed props — no global state library or Context involved.

## Design notes / assumptions

- The forecast endpoint returns 3-hour interval data for 5 days (up to 40
  entries). `groupForecastByDay` groups these by calendar date and picks the
  12:00 reading as the representative icon/description for that day (falling
  back to the middle entry if no midday reading exists), since noon is
  usually most representative of the day's general conditions.
- City search calls the API directly with the `q` parameter rather than a
  separate geocoding step, since the forecast endpoint accepts city names
  natively.
- Styling is plain CSS (`App.css`) — functional and readable, not intended
  to be a polished visual design per the assignment's requirements.

## Possible future improvements

- Debounce/autocomplete for city search (e.g. via OpenWeatherMap's geocoding API).
- Persist the last-searched city/units in localStorage.
- Graph the hourly temperature trend for the selected day.
