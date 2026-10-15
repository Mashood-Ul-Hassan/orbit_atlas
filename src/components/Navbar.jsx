import { Link, NavLink } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";

const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

export default function Navbar() {
  const { saved } = useFavorites();

  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link to="/" className="brand" aria-label="Orbit Atlas home">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <ellipse cx="16" cy="16" rx="5" ry="12" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 16h24M6 10h20M6 22h20" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="brand-name">Orbit Atlas</span>
        </Link>
        <nav aria-label="Main">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/countries" className={linkClass}>
            Explore
          </NavLink>
          <NavLink to="/saved" className={linkClass}>
            Saved
            {saved.length > 0 && <span className="count">{saved.length}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
