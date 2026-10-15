import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCountry } from "../api/countries";
import { ErrorPanel } from "../components/Feedback";
import Flag from "../components/Flag";
import SaveButton from "../components/SaveButton";
import WeatherCard from "../components/WeatherCard";
import { useCountries } from "../hooks/useCountries";
import { callingCode, full, regionColor } from "../utils/format";

export default function CountryDetail() {
  const { code } = useParams();
  const { byCode } = useCountries();
  // The result remembers which code it was fetched for. If it doesn't match
  // the code in the URL, the new country is still loading.
  const [result, setResult] = useState({ code: null, country: null, error: null });

  useEffect(() => {
    let ignore = false;
    getCountry(code)
      .then((country) => {
        if (!ignore) setResult({ code, country, error: null });
      })
      .catch((error) => {
        if (!ignore) setResult({ code, country: null, error });
      });
    return () => {
      ignore = true;
    };
  }, [code]);

  if (result.code !== code) {
    return (
      <section className="panel" role="status">
        <span className="sr-only">Loading country details</span>
        <div className="sk-line sk-wide" aria-hidden="true" />
        <div className="sk-line sk-narrow" aria-hidden="true" />
      </section>
    );
  }

  if (result.error) {
    const message =
      result.error.status === 404
        ? `No country matches the code "${code}".`
        : result.error.message;
    return (
      <ErrorPanel title="Country not available" message={message}>
        <Link className="btn btn-ghost" to="/countries">
          Back to Explore
        </Link>
      </ErrorPanel>
    );
  }

  const { country } = result;
  const capital = country.capital?.[0];
  const languages = country.languages.join(", ") || "—";
  const currencies =
    country.currencies.map((c) => (c.symbol ? `${c.name} (${c.symbol})` : c.name)).join(", ") || "—";
  const borders = country.borders;

  const readouts = [
    ["Capital", capital ?? "—"],
    ["Population", full(country.population)],
    ["Area", country.area == null ? "—" : `${full(country.area)} km²`],
    ["Subregion", country.subregion ?? "—"],
    ["Languages", languages],
    ["Currencies", currencies],
    ["Calling code", callingCode(country.callingCodes)],
    ["Time zones", country.timezones.length || "—"],
  ];

  return (
    <article>
      <Link to="/countries" className="back-link">
        Back to Explore
      </Link>

      <section className="panel detail-head" style={{ "--region": regionColor(country.region) }}>
        <Flag
          className="detail-flag"
          src={country.flags.svg || country.flags.png}
          alt={country.flags.alt}
          name={country.name.common}
        />
        <div>
          <h1 className="detail-title">{country.name.common}</h1>
          <p className="detail-official">{country.name.official}</p>
          <p className="detail-region">
            <span className="dot" aria-hidden="true" />
            {country.region}
          </p>
          <SaveButton code={country.cca3} name={country.name.common} variant="full" />
        </div>
      </section>

      <dl className="readouts">
        {readouts.map(([label, value]) => (
          <div className="readout" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <WeatherCard city={capital} countryCode={country.cca2} />

      <section>
        <h2 className="section-title">Bordering countries</h2>
        {borders.length === 0 ? (
          <p className="page-sub">{country.name.common} has no land borders.</p>
        ) : (
          <div className="neighbors">
            {borders.map((borderCode) => {
              const neighbor = byCode.get(borderCode);
              return (
                <Link key={borderCode} to={`/country/${borderCode}`} className="neighbor">
                  {neighbor && <img src={neighbor.flags.png} alt="" width="26" height="18" />}
                  {neighbor ? neighbor.name.common : borderCode}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}
