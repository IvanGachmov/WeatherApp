import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GeolocationButton from "./GeolocationButton";

function setGeolocation(value: Geolocation) {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value,
  });
}

describe("GeolocationButton", () => {
  it("returns the user's coordinates when geolocation succeeds", async () => {
    const onLocate = vi.fn();
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: { latitude: 48.8566, longitude: 2.3522 },
      } as GeolocationPosition);
    });
    setGeolocation({ getCurrentPosition } as unknown as Geolocation);

    const user = userEvent.setup();
    render(<GeolocationButton onLocate={onLocate} />);
    await user.click(screen.getByRole("button", { name: /use my location/i }));

    expect(onLocate).toHaveBeenCalledWith(
      { lat: 48.8566, lon: 2.3522 },
      null,
    );
  });

  it("returns the browser error when geolocation is denied", async () => {
    const onLocate = vi.fn();
    const getCurrentPosition = vi.fn(
      (_success: PositionCallback, failure: PositionErrorCallback) => {
        failure({ message: "User denied Geolocation" } as GeolocationPositionError);
      },
    );
    setGeolocation({ getCurrentPosition } as unknown as Geolocation);

    const user = userEvent.setup();
    render(<GeolocationButton onLocate={onLocate} />);
    await user.click(screen.getByRole("button", { name: /use my location/i }));

    expect(onLocate).toHaveBeenCalledWith(
      null,
      new Error("User denied Geolocation"),
    );
  });

  it("returns an error when geolocation is unsupported", async () => {
    const onLocate = vi.fn();
    setGeolocation(undefined as unknown as Geolocation);

    const user = userEvent.setup();
    render(<GeolocationButton onLocate={onLocate} />);
    await user.click(screen.getByRole("button", { name: /use my location/i }));

    expect(onLocate).toHaveBeenCalledWith(
      null,
      new Error("Geolocation is not supported by your browser."),
    );
  });
});