import { useCallback, useState } from "react";
import { fetchForecastByCity, fetchForecastByCoords } from "../api/weatherApi";
import { groupForecastByDay } from "../utils/groupForecastByDay";
import type { ForecastApiResponse, ForecastDay, Units } from "../types/weather";

type Query =
  { type: "city"; city: string } | { type: "coords"; lat: number; lon: number };

export default function useWeatherForecast() {
  const [days, setDays] = useState<ForecastDay[]>([]);
  const [cityLabel, setCityLabel] = useState("");
  const [units, setUnits] = useState<Units>("metric");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyForecastResponse = useCallback((data: ForecastApiResponse) => {
    const grouped = groupForecastByDay(data.list);
    setDays(grouped);
    setCityLabel(
      `${data.city.name}${data.city.country ? ", " + data.city.country : ""}`,
    );
    setSelectedDate(grouped.length > 0 ? grouped[0].date : null);
  }, []);

  const runQuery = useCallback(
    async (query: Query) => {
      setLoading(true);
      setError(null);

      try {
        const data =
          query.type === "city"
            ? await fetchForecastByCity(query.city)
            : await fetchForecastByCoords(query.lat, query.lon);
        applyForecastResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setDays([]);
        setCityLabel("");
        setSelectedDate(null);
      } finally {
        setLoading(false);
      }
    },
    [applyForecastResponse],
  );

  const searchCity = useCallback(
    (city: string) => {
      const query: Query = { type: "city", city };
      void runQuery(query);
    },
    [runQuery],
  );

  const loadByCoords = useCallback(
    (
      coords: { lat: number; lon: number } | null,
      locateError: Error | null,
    ) => {
      if (locateError || !coords) {
        setError(locateError?.message ?? "Unable to retrieve your location.");
        return;
      }

      const query: Query = { type: "coords", lat: coords.lat, lon: coords.lon };
      void runQuery(query);
    },
    [runQuery],
  );

  const changeUnits = useCallback((nextUnits: Units) => {
    setUnits(nextUnits);
  }, []);

  return {
    days,
    cityLabel,
    units,
    selectedDate,
    loading,
    error,
    setSelectedDate,
    searchCity,
    loadByCoords,
    changeUnits,
  };
}
