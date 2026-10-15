import { useContext } from "react";
import { CountriesContext } from "../context/countriesContext";

export function useCountries() {
  const context = useContext(CountriesContext);
  if (!context) throw new Error("useCountries must be used inside <CountriesProvider>");
  return context;
}
