import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [city, setCity] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = city.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Search city (e.g. London, GB)"
        aria-label="City name"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !city.trim()}>
        Search
      </button>
    </form>
  );
}
