const API_URL = "https://api.restcountries.com/countries/v5";
const FLAG_CDN = "https://flags.restcountries.com/v5";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

// Vite only exposes variables that start with VITE_ to browser code.
const COUNTRIES_KEY = import.meta.env.VITE_RESTCOUNTRIES_API_KEY;
const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const hasWeatherKey = Boolean(WEATHER_KEY);

export class ApiError extends Error {
  constructor(message, status = 0, kind = "http") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind; // "http" | "network" | "timeout"
  }
}

// One place for every network call: adds a timeout and turns failures into readable errors.
async function request(url, { headers, timeout = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(`The server answered with status ${response.status}.`, response.status);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError("The request took too long and was cancelled.", 0, "timeout");
    }
    throw new ApiError("The request could not reach the server.", 0, "network");
  } finally {
    clearTimeout(timer);
  }
}

// ---------- REST Countries (needs an API key) ----------

const STATUS_MESSAGES = {
  401: "REST Countries did not accept the API key. Check VITE_RESTCOUNTRIES_API_KEY in your .env file.",
  403: "REST Countries refused the request. The free plan allows 500 requests a month, so the quota may be used up.",
  429: "Too many requests in a short time. Wait a few seconds and try again.",
};

async function countriesRequest(path) {
  if (!COUNTRIES_KEY) {
    throw new ApiError(
      "No REST Countries API key was found. Add VITE_RESTCOUNTRIES_API_KEY to your .env file and restart npm run dev.",
    );
  }
  try {
    return await request(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${COUNTRIES_KEY}` },
    });
  } catch (err) {
    if (STATUS_MESSAGES[err.status]) throw new ApiError(STATUS_MESSAGES[err.status], err.status);
    if (err.kind === "network") {
      throw new ApiError(
        'The request was blocked or could not reach REST Countries. Check your connection, and make sure your API key allows the origin "localhost" (the browser console shows a CORS message when it does not).',
        0,
        "network",
      );
    }
    throw err;
  }
}

// The API's records are deeply nested. This flattens one into the simple shape
// every component in the app uses, so the rest of the code never sees the raw format.
function normalize(raw) {
  const alpha2 = raw.codes?.alpha_2 ?? "";
  const alpha3 = String(raw.codes?.alpha_3 ?? "").toUpperCase();
  const isPrimary = (c) => Boolean(c.primary ?? c.attributes?.primary);
  const capitals = [...(raw.capitals ?? [])].sort((a, b) => Number(isPrimary(b)) - Number(isPrimary(a)));
  const languages = Array.isArray(raw.languages) ? raw.languages : Object.values(raw.languages ?? {});
  const currencies = Array.isArray(raw.currencies) ? raw.currencies : Object.values(raw.currencies ?? {});
  const flagName = String(alpha2).toLowerCase();
  const hasFlagFile = /^[a-z]{2}$/.test(flagName); // the flag CDN is keyed by 2-letter codes

  return {
    cca2: alpha2,
    cca3: alpha3,
    name: { common: raw.names?.common ?? alpha3, official: raw.names?.official ?? "" },
    flags: {
      png: hasFlagFile ? `${FLAG_CDN}/w320/${flagName}.png` : "",
      svg: raw.flag?.url_svg || (hasFlagFile ? `${FLAG_CDN}/svg/${flagName}.svg` : ""),
      alt: raw.flag?.description || "",
    },
    capital: capitals.map((c) => c.name),
    region: raw.region ?? "",
    subregion: raw.subregion ?? "",
    population: Number(raw.population) || 0,
    area: raw.area?.kilometers ?? null,
    languages: languages.map((l) => (typeof l === "string" ? l : l.name)).filter(Boolean),
    currencies: currencies.map((c) => ({ name: c.name ?? c.code ?? "", symbol: c.symbol ?? "" })),
    callingCodes: raw.calling_codes ?? [],
    timezones: raw.timezones ?? [],
    borders: raw.borders ?? [],
  };
}

// ---------- Cache ----------
// The free plan allows only 500 requests a month, so answers are kept in the
// browser for 24 hours, and two identical requests at the same time share one call.

// Bump the version whenever the shape of cached data changes, so old entries are ignored.
const CACHE_PREFIX = "orbit-atlas:cache:v2:";
const OLD_CACHE_PREFIX = "orbit-atlas:cache:";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const inflight = new Map();

// Remove entries written by earlier versions of the app.
try {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(OLD_CACHE_PREFIX) && !k.startsWith(CACHE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
} catch {
  // Storage unavailable: nothing to clean.
}

function readCache(key) {
  try {
    const entry = JSON.parse(localStorage.getItem(CACHE_PREFIX + key));
    if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  } catch {
    // Missing or unreadable cache: just fetch again.
  }
  return null;
}

function writeCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ time: Date.now(), data }));
  } catch {
    // Storage full or blocked: the app still works, it just asks the API more often.
  }
}

function cached(key, load) {
  const hit = readCache(key);
  if (hit) return Promise.resolve(hit);
  if (!inflight.has(key)) {
    const promise = load()
      .then((data) => {
        writeCache(key, data);
        return data;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, promise);
  }
  return inflight.get(key);
}

// ---------- Public functions used by the app ----------

const LIST_FIELDS = "names.common,codes.alpha_2,codes.alpha_3,capitals,region,population";
const DETAIL_FIELDS =
  "names.common,names.official,codes.alpha_2,codes.alpha_3,capitals,flag.url_svg,flag.description," +
  "region,subregion,population,area,languages,currencies,calling_codes,timezones,borders";
const PAGE_SIZE = 100; // the largest page the free plan allows

async function fetchAllPages() {
  const all = [];
  let offset = 0;
  let more = true;
  while (more) {
    const page = await countriesRequest(
      `?response_fields=${LIST_FIELDS}&limit=${PAGE_SIZE}&offset=${offset}`,
    );
    const objects = page?.data?.objects;
    if (!Array.isArray(objects)) throw new ApiError("The countries service sent an unexpected answer.");
    all.push(...objects);
    more = Boolean(page.data.meta?.more) && objects.length > 0;
    offset += PAGE_SIZE;
  }
  return all;
}

// Disputed territories such as Abkhazia or Somaliland have no ISO code. They cannot be
// opened by code, saved reliably or matched to a flag file, so they are left out.
// Duplicate records are dropped too, because every card needs a unique code.
const ISO_ALPHA3 = /^[A-Z]{3}$/;

export function getAllCountries() {
  return cached("list", async () => {
    const unique = new Map();
    for (const record of await fetchAllPages()) {
      const country = normalize(record);
      if (ISO_ALPHA3.test(country.cca3) && !unique.has(country.cca3)) {
        unique.set(country.cca3, country);
      }
    }
    return [...unique.values()];
  });
}

export function getCountry(code) {
  const upper = String(code).toUpperCase();
  return cached(`country:${upper}`, async () => {
    const page = await countriesRequest(
      `/codes.alpha_3/${encodeURIComponent(upper)}?response_fields=${DETAIL_FIELDS}`,
    );
    const raw = page?.data?.objects?.[0];
    if (!raw) throw new ApiError("No country found.", 404);
    return normalize(raw);
  });
}

// ---------- OpenWeatherMap (needs its own API key) ----------

export function getWeather(city, countryCode) {
  const params = new URLSearchParams({
    q: `${city},${countryCode}`,
    appid: WEATHER_KEY,
    units: "metric",
  });
  return request(`${WEATHER_URL}?${params}`);
}
