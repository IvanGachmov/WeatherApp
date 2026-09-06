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
  function handleClick() {
    if (!navigator.geolocation) {
      onLocate(
        null,
        new Error("Geolocation is not supported by your browser."),
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate(
          {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          null,
        );
      },
      (error) => {
        onLocate(
          null,
          new Error(error.message || "Unable to retrieve your location."),
        );
      },
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled}>
      Use my location
    </button>
  );
}
