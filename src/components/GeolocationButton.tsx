import { useState } from "react";

interface GeolocationButtonProps {
  onLocate: (
    coords: { lat: number; lon: number } | null,
    error: Error | null,
  ) => void;
  disabled?: boolean;
}

export default function GeolocationButton({
  onLocate,
  disabled,
}: GeolocationButtonProps) {
  const [locating, setLocating] = useState(false);

  function handleClick() {
    if (locating) return;
    setLocating(true);

    if (!navigator.geolocation) {
      onLocate(
        null,
        new Error("Geolocation is not supported by your browser."),
      );
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onLocate(
          {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          null,
        );
      },
      (error) => {
        setLocating(false);
        onLocate(
          null,
          new Error(error.message || "Unable to retrieve your location."),
        );
      },
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled || locating}>
      Use my location
    </button>
  );
}
