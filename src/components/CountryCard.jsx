import { Link } from "react-router-dom";
import { compact, regionColor } from "../utils/format";
import Flag from "./Flag";
import SaveButton from "./SaveButton";

export default function CountryCard({ country }) {
  const { cca3, name, flags, capital, region, population } = country;

  return (
    <article className="card" style={{ "--region": regionColor(region) }}>
      <Link to={`/country/${cca3}`} className="card-link">
        <Flag className="card-flag" src={flags.png} alt={flags.alt} name={name.common} />
        <div className="card-body">
          <h3 className="card-name">{name.common}</h3>
          <p className="card-capital">{capital?.[0] ?? "No capital"}</p>
          <div className="card-meta">
            <span>
              <span className="dot" aria-hidden="true" />
              {region}
            </span>
            <span className="card-pop">{compact(population)} people</span>
          </div>
        </div>
      </Link>
      <SaveButton code={cca3} name={name.common} />
    </article>
  );
}
