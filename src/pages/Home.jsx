import { useMemo } from "react";
import { Link } from "react-router-dom";
import CountryCard from "../components/CountryCard";
import { ErrorPanel, SkeletonGrid } from "../components/Feedback";
import Globe from "../components/Globe";
import { useCountries } from "../hooks/useCountries";
import { compact } from "../utils/format";

// Fixed when the page loads, so "featured today" stays the same all day.
const DAY = Math.floor(Date.now() / 86_400_000);

export default function Home() {
  const { countries, status, error, retry } = useCountries();
  const ready = status === "ready";

  const stats = useMemo(
    () => ({
      total: countries.length,
      people: countries.reduce((sum, c) => sum + c.population, 0),
      regions: new Set(countries.map((c) => c.region)).size,
    }),
    [countries],
  );

  const featured = useMemo(
    () =>
      countries.length === 0
        ? []
        : [0, 1, 2].map((i) => countries[(DAY * 3 + i * 37) % countries.length]),
    [countries],
  );

  return (
    <>
      <section className="hero">
        <div>
          <h1>Every country, one live atlas.</h1>
          <p className="lede">
            Browse every country, filter by region, check the weather in each capital, and save the
            places you want to come back to.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/countries">
              Explore countries
            </Link>
            <Link className="btn btn-ghost" to="/saved">
              Saved places
            </Link>
          </div>
          <dl className="stats">
            <div className="stat">
              <dt>Countries</dt>
              <dd>{ready ? stats.total : "—"}</dd>
            </div>
            <div className="stat">
              <dt>People</dt>
              <dd>{ready ? compact(stats.people) : "—"}</dd>
            </div>
            <div className="stat">
              <dt>Regions</dt>
              <dd>{ready ? stats.regions : "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="globe-wrap">
          <Globe />
        </div>
      </section>

      <section>
        <h2 className="section-title">Featured today</h2>
        {status === "loading" && <SkeletonGrid count={3} />}
        {status === "error" && (
          <ErrorPanel
            title="Couldn't load the countries"
            message={error}
            onRetry={retry}
          />
        )}
        {ready && (
          <div className="grid">
            {featured.map((country) => (
              <CountryCard key={country.cca3} country={country} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
