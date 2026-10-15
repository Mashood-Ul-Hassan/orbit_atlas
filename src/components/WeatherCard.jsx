import { useEffect, useState } from "react";
import { getWeather, hasWeatherKey } from "../api/countries";

function describeError(err, city) {
  if (err.status === 401) {
    return "OpenWeatherMap rejected the API key. New keys can take a couple of hours to start working.";
  }
  if (err.status === 404) return `OpenWeatherMap has no weather data for ${city}.`;
  return err.message;
}

export default function WeatherCard({ city, countryCode }) {
  const key = `${city},${countryCode}`;
  const [result, setResult] = useState({ key: null, data: null, error: "" });

  useEffect(() => {
    if (!hasWeatherKey || !city) return undefined;
    let ignore = false;
    getWeather(city, countryCode)
      .then((data) => {
        if (!ignore) setResult({ key, data, error: "" });
      })
      .catch((err) => {
        if (!ignore) setResult({ key, data: null, error: describeError(err, city) });
      });
    return () => {
      ignore = true;
    };
  }, [city, countryCode, key]);

  if (!city) {
    return (
      <section className="panel notice">
        <h2 className="notice-title">Weather</h2>
        <p>This country has no capital city to look up.</p>
      </section>
    );
  }

  if (!hasWeatherKey) {
    return (
      <section className="panel notice">
        <h2 className="notice-title">Live weather is switched off</h2>
        <p>
          Add your OpenWeatherMap key to a <code>.env</code> file as{" "}
          <code>VITE_OPENWEATHER_API_KEY</code>, then restart <code>npm run dev</code>.
        </p>
      </section>
    );
  }

  if (result.key !== key) {
    return (
      <section className="panel weather" role="status">
        <span className="sr-only">Loading weather</span>
        <div className="sk-line sk-wide" aria-hidden="true" />
        <div className="sk-line sk-narrow" aria-hidden="true" />
      </section>
    );
  }

  if (result.error) {
    return (
      <section className="panel notice notice-error" role="alert">
        <h2 className="notice-title">Weather in {city} is unavailable</h2>
        <p>{result.error}</p>
      </section>
    );
  }

  const { main, wind, weather } = result.data;
  return (
    <section className="panel weather">
      <h2 className="section-title">Weather in {city}</h2>
      <div className="weather-main">
        <img
          className="weather-icon"
          src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
          alt=""
          width="64"
          height="64"
        />
        <div>
          <div className="weather-temp">{Math.round(main.temp)}°C</div>
          <div className="weather-desc">{weather[0].description}</div>
        </div>
      </div>
      <dl className="facts">
        <div className="fact">
          <dt>Feels like</dt>
          <dd>{Math.round(main.feels_like)}°C</dd>
        </div>
        <div className="fact">
          <dt>Humidity</dt>
          <dd>{main.humidity}%</dd>
        </div>
        <div className="fact">
          <dt>Wind</dt>
          <dd>{wind.speed} m/s</dd>
        </div>
      </dl>
    </section>
  );
}
