import type { ForecastApiResponse } from "../types/weather";

const API_BASE = "https://api.openweathermap.org/data/2.5/forecast";

function getApiKey(): string {
  const key = import.meta.env.VITE_OWM_API_KEY;
  if (!key) {
    throw new Error(
      "Missing OpenWeatherMap API key. Copy .env.example to .env and set VITE_OWM_API_KEY.",
    );
  }
  return key;
}

async function handleResponse(
  response: Response,
): Promise<ForecastApiResponse> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.message) message = data.message;
    } catch {
      // Response body wasn't JSON; fall back to the default message.
    }
    throw new Error(message);
  }
  return response.json() as Promise<ForecastApiResponse>;
}

export async function fetchForecastByCity(
  city: string,
): Promise<ForecastApiResponse> {
  const apiKey = getApiKey();
  const url = `${API_BASE}?q=${encodeURIComponent(city)}&appid=${apiKey}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function fetchForecastByCoords(
  lat: number,
  lon: number,
): Promise<ForecastApiResponse> {
  const apiKey = getApiKey();
  const url = `${API_BASE}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const response = await fetch(url);
  return handleResponse(response);
}
