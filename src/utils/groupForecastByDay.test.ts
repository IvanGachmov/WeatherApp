import { describe, it, expect } from "vitest";
import {
  groupForecastByDay,
  formatDayLabel,
  formatHourLabel,
} from "./groupForecastByDay";
import type { ForecastEntry } from "../types/weather";

function makeEntry(
  dtText: string,
  temp: number,
  tempMin: number,
  tempMax: number,
  icon = "01d",
  description = "clear sky",
): ForecastEntry {
  return {
    dt: Date.parse(`${dtText.replace(" ", "T")}Z`) / 1000,
    dt_txt: dtText,
    main: { temp, temp_min: tempMin, temp_max: tempMax, humidity: 50 },
    weather: [{ description, icon }],
    wind: { speed: 3 },
  };
}

describe("groupForecastByDay", () => {
  it("groups entries by calendar date", () => {
    const list = [
      makeEntry("2024-01-01 00:00:00", 10, 8, 12),
      makeEntry("2024-01-01 12:00:00", 15, 13, 16),
      makeEntry("2024-01-02 00:00:00", 5, 3, 6),
    ];
    const days = groupForecastByDay(list);
    expect(days).toHaveLength(2);
    expect(days[0].date).toBe("2024-01-01");
    expect(days[0].entries).toHaveLength(2);
    expect(days[1].date).toBe("2024-01-02");
  });

  it("groups entries by the forecast city's local date", () => {
    const list = [makeEntry("2024-01-01 23:00:00", 10, 8, 12)];
    const days = groupForecastByDay(list, 2 * 60 * 60);

    expect(days[0].date).toBe("2024-01-02");
  });

  it("calculates min and max temps across all entries in the day", () => {
    const list = [
      makeEntry("2024-01-01 00:00:00", 10, 8, 12),
      makeEntry("2024-01-01 12:00:00", 15, 13, 16),
    ];
    const [day] = groupForecastByDay(list);
    expect(day.minTemp).toBe(8);
    expect(day.maxTemp).toBe(16);
  });

  it("prefers the midday (12:00) entry as the representative icon/description", () => {
    const list = [
      makeEntry("2024-01-01 00:00:00", 10, 8, 12, "01n", "clear sky"),
      makeEntry("2024-01-01 12:00:00", 15, 13, 16, "02d", "few clouds"),
    ];
    const [day] = groupForecastByDay(list);
    expect(day.icon).toBe("02d");
    expect(day.description).toBe("few clouds");
  });

  it("falls back to the middle entry when there is no midday reading", () => {
    const list = [
      makeEntry("2024-01-01 03:00:00", 10, 8, 12, "01n", "clear"),
      makeEntry("2024-01-01 06:00:00", 11, 9, 13, "02n", "partly cloudy"),
      makeEntry("2024-01-01 09:00:00", 12, 10, 14, "03d", "scattered clouds"),
    ];
    const [day] = groupForecastByDay(list);
    expect(day.icon).toBe("02n");
  });

  it("limits the result to a maximum of 5 days", () => {
    const list: ForecastEntry[] = [];
    for (let d = 1; d <= 6; d++) {
      list.push(makeEntry(`2024-01-0${d} 12:00:00`, 10, 8, 12));
    }
    const days = groupForecastByDay(list);
    expect(days).toHaveLength(5);
  });

  it("returns an empty array for empty or missing input", () => {
    expect(groupForecastByDay([])).toEqual([]);
    expect(groupForecastByDay()).toEqual([]);
  });
});

describe("formatDayLabel", () => {
  it("formats a date string into a short weekday/month/day label", () => {
    const label = formatDayLabel("2024-01-01");
    expect(label).toEqual(expect.stringContaining("Jan"));
    expect(label).toEqual(expect.stringContaining("1"));
  });
});

describe("formatHourLabel", () => {
  it("formats a dt_txt string into a non-empty time label", () => {
    const label = formatHourLabel("2024-01-01 15:00:00");
    expect(typeof label).toBe("string");
    expect(label.length).toBeGreaterThan(0);
  });

  it("formats the hour in the forecast city's timezone", () => {
    const label = formatHourLabel("2024-01-01 23:00:00", 2 * 60 * 60);

    expect(label).toMatch(/1:00\s*AM/i);
  });
});
