import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

// Wraps every page: top bar, the page itself (<Outlet />) and a footer.
export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="shell page">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="shell">
          Country data from <a href="https://restcountries.com">REST Countries</a>. Weather from{" "}
          <a href="https://openweathermap.org">OpenWeatherMap</a>.
        </div>
      </footer>
    </>
  );
}
