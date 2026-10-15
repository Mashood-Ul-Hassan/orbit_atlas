import { useEffect, useMemo, useState } from "react";
import { getAllCountries } from "../api/countries";
import { CountriesContext } from "./countriesContext";

// Loads the country list once and shares it with every page.
export function CountriesProvider({ children }) {
  const [attempt, setAttempt] = useState(0);
  // The result remembers which attempt it belongs to, so "loading" is simply
  // "the newest attempt has not answered yet".
  const [result, setResult] = useState({ attempt: -1, data: [], error: "" });

  useEffect(() => {
    let ignore = false;
    getAllCountries()
      .then((data) => {
        if (ignore) return;
        const sorted = [...data].sort((a, b) => a.name.common.localeCompare(b.name.common));
        setResult({ attempt, data: sorted, error: "" });
      })
      .catch((err) => {
        console.error("Could not load countries:", err);
        if (!ignore) setResult({ attempt, data: [], error: err.message });
      });
    return () => {
      ignore = true;
    };
  }, [attempt]);

  const status = result.attempt !== attempt ? "loading" : result.error ? "error" : "ready";

  const value = useMemo(
    () => ({
      countries: result.data,
      byCode: new Map(result.data.map((c) => [c.cca3, c])),
      status,
      error: result.error,
      retry: () => setAttempt((n) => n + 1),
    }),
    [result, status],
  );

  return <CountriesContext.Provider value={value}>{children}</CountriesContext.Provider>;
}
