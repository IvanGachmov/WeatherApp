import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ForecastApiResponse } from "./types/weather";

jest.unstable_mockModule("./api/weatherApi", () => ({
  fetchForecastByCity: jest.fn(),
  fetchForecastByCoords: jest.fn(),
}));

const api = await import("./api/weatherApi");
const { default: App } = await import("./App");

const sampleResponse: ForecastApiResponse = {
  city: { name: "Paris", country: "FR", timezone: 2 * 60 * 60 },
  list: [
    {
      dt: 1704110400,
      dt_txt: "2024-01-01 12:00:00",
      main: { temp: 273.15, temp_min: 273.15, temp_max: 273.15, humidity: 60 },
      weather: [{ description: "clear sky", icon: "01d" }],
      wind: { speed: 2 },
    },
    {
      dt: 1704196800,
      dt_txt: "2024-01-02 12:00:00",
      main: { temp: 280.15, temp_min: 280.15, temp_max: 280.15, humidity: 65 },
      weather: [{ description: "few clouds", icon: "02d" }],
      wind: { speed: 3 },
    },
  ],
};

const originalGeolocation = Object.getOwnPropertyDescriptor(
  navigator,
  "geolocation",
);

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalGeolocation) {
      Object.defineProperty(navigator, "geolocation", originalGeolocation);
    } else {
      Reflect.deleteProperty(navigator, "geolocation");
    }
  });

  it("searches for a city and displays the resulting forecast", async () => {
    const mockFetchForecastByCity = jest.mocked(api.fetchForecastByCity);
    mockFetchForecastByCity.mockResolvedValue(sampleResponse);
    const user = userEvent.setup();

    render(<App />);
    await user.type(screen.getByLabelText(/city name/i), "Paris");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/Paris, FR/)).toBeInTheDocument();
    });
    expect(api.fetchForecastByCity).toHaveBeenCalledWith("Paris");
    const forecastList = screen.getAllByRole("list")[0];
    expect(within(forecastList).getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows an error message when the API request fails", async () => {
    const mockFetchForecastByCity = jest.mocked(api.fetchForecastByCity);
    mockFetchForecastByCity.mockRejectedValue(new Error("city not found"));
    const user = userEvent.setup();

    render(<App />);
    await user.type(screen.getByLabelText(/city name/i), "Nowhereville");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("city not found");
    });
  });

  it("loads a forecast using the user's coordinates", async () => {
    const mockFetchForecastByCoords = jest.mocked(api.fetchForecastByCoords);
    mockFetchForecastByCoords.mockResolvedValue(sampleResponse);
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: { latitude: 48.8566, longitude: 2.3522 },
          } as GeolocationPosition);
        },
      },
    });
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: /use my location/i }));

    await waitFor(() => {
      expect(screen.getByText(/Paris, FR/)).toBeInTheDocument();
    });
    expect(mockFetchForecastByCoords).toHaveBeenCalledWith(48.8566, 2.3522);
  });

  it("shows hourly detail when a day card is selected", async () => {
    const mockFetchForecastByCity = jest.mocked(api.fetchForecastByCity);
    mockFetchForecastByCity.mockResolvedValue(sampleResponse);
    const user = userEvent.setup();

    render(<App />);
    await user.type(screen.getByLabelText(/city name/i), "Paris");
    await user.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() => screen.getByText(/Paris, FR/));
    expect(screen.getByText(/2:00 PM/i)).toBeInTheDocument();

    const dayButtons = screen.getAllByRole("button", {
      name: /clear sky|few clouds/i,
    });
    await user.click(dayButtons[1]);

    expect(screen.getByText(/hourly forecast for/i)).toBeInTheDocument();
  });

  it("changes display units without making another API request", async () => {
    const mockFetchForecastByCity = jest.mocked(api.fetchForecastByCity);
    mockFetchForecastByCity.mockResolvedValue(sampleResponse);
    const user = userEvent.setup();

    render(<App />);
    await user.type(screen.getByLabelText(/city name/i), "Paris");
    await user.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() => screen.getByText(/Paris, FR/));
    expect(api.fetchForecastByCity).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("0°C").length).toBeGreaterThan(0);
    expect(screen.getByText("Wind: 2 m/s")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "imperial");

    expect(screen.getByRole("combobox")).toHaveValue("imperial");
    expect(screen.getAllByText("32°F").length).toBeGreaterThan(0);
    expect(screen.getByText("Wind: 4 mph")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "kelvin");

    expect(screen.getByRole("combobox")).toHaveValue("kelvin");
    expect(screen.getAllByText("273K").length).toBeGreaterThan(0);
    expect(api.fetchForecastByCity).toHaveBeenCalledTimes(1);
  });
});
