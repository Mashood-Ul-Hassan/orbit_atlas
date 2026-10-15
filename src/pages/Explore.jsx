import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CountryCard from "../components/CountryCard";
import { EmptyState, ErrorPanel, SkeletonGrid } from "../components/Feedback";
import { useCountries } from "../hooks/useCountries";
import { REGIONS, regionColor } from "../utils/format";

const SORTS = {
  name: "Name, A to Z",
  "pop-desc": "Population, high to low",
  "pop-asc": "Population, low to high",
};

export default function Explore() {
  const { countries, status, error, retry } = useCountries();
  // Filters live in the URL (?q=pak&region=Asia), so a refresh or a shared link keeps them.
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const region = params.get("region") ?? "All";
  const sort = params.get("sort") ?? "name";

  function setParam(key, value, fallback) {
    const next = new URLSearchParams(params);
    if (!value || value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = countries.filter(
      (c) =>
        (region === "All" || c.region === region) &&
        (c.name.common.toLowerCase().includes(q) || c.capital?.[0]?.toLowerCase().includes(q)),
    );
    if (sort === "pop-desc") list.sort((a, b) => b.population - a.population);
    if (sort === "pop-asc") list.sort((a, b) => a.population - b.population);
    return list;
  }, [countries, query, region, sort]);

  return (
    <>
      <h1 className="page-title">Explore countries</h1>
      <p className="page-sub">
        {status === "ready"
          ? `${visible.length} of ${countries.length} countries shown.`
          : "Fetching the latest country data."}
      </p>

      <div className="toolbar">
        <div>
          <label className="sr-only" htmlFor="search">
            Search by country or capital
          </label>
          <input
            id="search"
            className="field"
            type="search"
            placeholder="Search by country or capital"
            value={query}
            onChange={(e) => setParam("q", e.target.value, "")}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="sort">
            Sort countries
          </label>
          <select
            id="sort"
            className="field"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value, "name")}
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Filter by region">
        {["All", ...REGIONS].map((r) => (
          <button
            key={r}
            type="button"
            className="chip"
            aria-pressed={region === r}
            onClick={() => setParam("region", r, "All")}
          >
            {r !== "All" && (
              <span className="dot" style={{ "--region": regionColor(r) }} aria-hidden="true" />
            )}
            {r}
          </button>
        ))}
      </div>

      {status === "loading" && <SkeletonGrid />}

      {status === "error" && (
        <ErrorPanel
          title="Couldn't load the countries"
          message={error}
          onRetry={retry}
        />
      )}

      {status === "ready" && visible.length === 0 && (
        <EmptyState title="No countries match" text="Try a different spelling or another region.">
          <button type="button" className="btn btn-ghost" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </button>
        </EmptyState>
      )}

      {status === "ready" && visible.length > 0 && (
        <div className="grid">
          {visible.map((country) => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </div>
      )}
    </>
  );
}
