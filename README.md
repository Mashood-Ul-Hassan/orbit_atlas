# Orbit Atlas

A multi-page React app for exploring the countries of the world. Search and filter every country, open a country for its details and the live weather in its capital, and save the ones you want to come back to.

**Live demo:** https://orbit-atlas-gray.vercel.app/

<!-- Add a screenshot after you take one:
![Home page](docs/home.png)
-->

## Features

- **Home:** animated SVG globe, live statistics (number of countries, world population, regions) and three featured countries that change daily
- **Explore:** search by country or capital, filter by region, sort by name or population; the filters live in the URL, so a refresh or a shared link keeps them
- **Country page:** flag, official name, region, eight facts (capital, population, area, subregion, languages, currencies, calling code, time zones), live weather in the capital, and links to bordering countries
- **Saved:** star any country to save it; the list is remembered in the browser and shown with a count in the navbar
- **Resilient by design:** loading skeletons, clear error messages with a retry button, empty states, a fallback tile when a flag image is missing, and a 404 page
- **Responsive and accessible:** mobile-first layout, semantic HTML, skip link, visible keyboard focus, labelled controls, and reduced-motion support

## Tech stack

| Area | Tools |
|---|---|
| Framework | React 19, React Router 7 |
| Build tooling | Vite 8, Oxlint |
| Styling | Plain CSS (custom properties, Grid, Flexbox, mobile-first media queries, keyframe animations) |
| Data | REST Countries API (v5), OpenWeatherMap API, REST Countries Flag CDN |
| Browser features | `fetch` with `AbortController`, `localStorage`, `Intl.NumberFormat` |
| Fonts | Unbounded and Instrument Sans (Google Fonts) |
| Hosting | Vercel |

## Getting started

You need a current LTS version of [Node.js](https://nodejs.org) and two free API keys.

1. **Clone and install**

   ```bash
   git clone https://github.com/Mashood-Ul-Hassan/orbit_atlas.git
   cd orbit_atlas
   npm install
   ```

2. **Get the API keys**

   - **REST Countries** (required): sign up at [restcountries.com](https://restcountries.com), create a key on the API Keys page, and add `localhost` to the key's CORS allowed origins. Browser requests are blocked unless the page's hostname is allowed.
   - **OpenWeatherMap** (optional, only the weather panel needs it): create a key at [openweathermap.org](https://openweathermap.org/api). New keys can take a couple of hours to activate.

3. **Create a `.env` file** in the project root (see `.env.example`):

   ```
   VITE_RESTCOUNTRIES_API_KEY=your_key_here
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

   No quotes, no spaces around `=`. Restart the dev server after editing this file.

4. **Run it**

   ```bash
   npm run dev
   ```

   Open the address Vite prints, usually http://localhost:5173.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Check the code with Oxlint |

## Project structure

```
orbit_atlas/
├── index.html
├── vercel.json              Makes page refreshes work on Vercel
├── .env.example             Names of the environment variables
└── src/
    ├── main.jsx             Entry point: router and providers
    ├── App.jsx              Route table
    ├── index.css            All styles: design tokens, layout, components
    ├── api/countries.js     Every network call, caching and data clean-up
    ├── context/             Shared state: country list and saved countries
    ├── hooks/               useCountries, useFavorites
    ├── utils/format.js      Number formatting and region colors
    ├── components/          Layout, Navbar, Globe, CountryCard, Flag,
    │                        SaveButton, WeatherCard, Feedback
    └── pages/               Home, Explore, CountryDetail, Saved, NotFound
```

## How it works

1. `main.jsx` mounts the app inside the router and two context providers.
2. `CountriesProvider` asks `api/countries.js` for the country list. The API layer checks a 24-hour browser cache first; if it is empty, it fetches the list in pages of 100 with the API key.
3. Each raw record is flattened into a simple shape, so no component ever sees the API's nested format. Records without an ISO country code (such as disputed territories) and duplicates are dropped.
4. Explore filters and sorts the list in memory; search, region and sort are stored in the URL.
5. Opening a country fetches its full record (also cached), then `WeatherCard` requests the capital's weather from OpenWeatherMap.
6. Saved countries live in a context backed by `localStorage`, so the navbar badge and the Saved page always agree.

Two details worth knowing:

- **Stale responses are ignored.** Each result remembers which request it belongs to, so a slow old response can never overwrite a newer one.
- **The free API quota is protected.** REST Countries' free plan allows 500 requests a month, so answers are cached for 24 hours and identical simultaneous requests share one call.

## Deployment

The project is set up for [Vercel](https://vercel.com):

1. Import the GitHub repository (Vercel detects Vite automatically).
2. Add `VITE_RESTCOUNTRIES_API_KEY` and `VITE_OPENWEATHER_API_KEY` as environment variables before the first deploy. Vite builds them into the site at build time, so redeploy after changing them.
3. Add the deployed hostname (for example `your-project.vercel.app`, without `https://`) to the REST Countries key's CORS allowed origins.

`vercel.json` rewrites every path to `index.html`, so refreshing a page such as `/countries` works.

## Known limitations

- Because this is a front-end only app, both API keys are visible in the browser. The REST Countries key is limited to the hostnames you allow; the OpenWeatherMap key is not. Treat both as low-value keys.
- The 500 requests a month free quota limits how many new visitors the live site can serve.
- Disputed territories without an ISO country code are not listed.
- There is no automated test suite yet.

## Possible next steps

- Move the API calls behind a small back-end (for example a serverless function) that caches responses for all visitors and keeps the key off the browser
- Add automated tests for the data layer and the main user flows

## Credits

- Country data from [REST Countries](https://restcountries.com)
- Weather data from [OpenWeatherMap](https://openweathermap.org)

## Author

**Mashood ul Hassan** · [GitHub](https://github.com/Mashood-Ul-Hassan) · [LinkedIn](https://www.linkedin.com/in/mashood-ul-hassan/)
