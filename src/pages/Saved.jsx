import { Link } from "react-router-dom";
import CountryCard from "../components/CountryCard";
import { EmptyState, ErrorPanel, SkeletonGrid } from "../components/Feedback";
import { useCountries } from "../hooks/useCountries";
import { useFavorites } from "../hooks/useFavorites";

export default function Saved() {
  const { byCode, status, error, retry } = useCountries();
  const { saved, clear } = useFavorites();

  function handleClear() {
    if (window.confirm("Remove all saved countries?")) clear();
  }

  const countries = saved.map((code) => byCode.get(code)).filter(Boolean);

  return (
    <>
      <h1 className="page-title">Saved places</h1>
      <p className="page-sub">
        {saved.length === 0
          ? "Countries you save stay on this device."
          : `${saved.length} saved on this device.`}
      </p>

      {saved.length === 0 && (
        <EmptyState title="Nothing saved yet" text="Tap the star on any country to keep it here.">
          <Link className="btn btn-primary" to="/countries">
            Explore countries
          </Link>
        </EmptyState>
      )}

      {saved.length > 0 && status === "loading" && <SkeletonGrid count={saved.length} />}

      {saved.length > 0 && status === "error" && (
        <ErrorPanel
          title="Couldn't load your saved countries"
          message={`${error} Your saved list is safe.`}
          onRetry={retry}
        />
      )}

      {saved.length > 0 && status === "ready" && (
        <>
          <div className="grid">
            {countries.map((country) => (
              <CountryCard key={country.cca3} country={country} />
            ))}
          </div>
          <p className="clear-row">
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              Remove all
            </button>
          </p>
        </>
      )}
    </>
  );
}
