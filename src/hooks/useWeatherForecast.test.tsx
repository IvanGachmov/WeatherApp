import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import type { ForecastApiResponse } from "../types/weather";

jest.unstable_mockModule("../api/weatherApi", () => ({
  fetchForecastByCity: jest.fn(),
  fetchForecastByCoords: jest.fn(),
}));

const api = await import("../api/weatherApi");
const { default: useWeatherForecast } = await import("./useWeatherForecast");

function makeResponse(city: string): ForecastApiResponse {
  return {
    city: { name: city, country: "FR", timezone: 0 },
    list: [
      {
        dt: 1704110400,
        dt_txt: "2024-01-01 12:00:00",
        main: { temp: 273.15, temp_min: 273.15, temp_max: 273.15, humidity: 50 },
        weather: [{ description: "clear sky", icon: "01d" }],
        wind: { speed: 2 },
      },
    ],
  };
}

function TestHarness() {
  const { cityLabel, searchCity } = useWeatherForecast();

  return (
    <>
      <button type="button" onClick={() => searchCity("Paris")}>
        Paris
      </button>
      <button type="button" onClick={() => searchCity("London")}>
        London
      </button>
      <output data-testid="city">{cityLabel}</output>
    </>
  );
}

describe("useWeatherForecast", () => {
  it("ignores an older request when it resolves after a newer request", async () => {
    let resolveParis!: (response: ForecastApiResponse) => void;
    let resolveLondon!: (response: ForecastApiResponse) => void;

    jest.mocked(api.fetchForecastByCity).mockImplementation((city) => {
      return new Promise((resolve) => {
        if (city === "Paris") resolveParis = resolve;
        else resolveLondon = resolve;
      });
    });

    const { getByRole } = render(<TestHarness />);
    getByRole("button", { name: "Paris" }).click();
    getByRole("button", { name: "London" }).click();

    resolveLondon(makeResponse("London"));
    await waitFor(() => expect(screen.getByTestId("city")).toHaveTextContent("London"));

    resolveParis(makeResponse("Paris"));
    await waitFor(() => expect(screen.getByTestId("city")).toHaveTextContent("London"));
  });
});