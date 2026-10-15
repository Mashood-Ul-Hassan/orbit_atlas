export const REGIONS = ["Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"];

// Each region has its own colour, used for the card's top edge and the dots.
const REGION_COLORS = {
  Africa: "#ffb547",
  Americas: "#ff7a8a",
  Asia: "#b78cff",
  Europe: "#52d9ff",
  Oceania: "#6de8a0",
  Antarctic: "#e6eeff",
};

export const regionColor = (region) => REGION_COLORS[region] ?? "#94a3cc";

const compactFormat = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const fullFormat = new Intl.NumberFormat("en");

export const compact = (n) => compactFormat.format(n);
export const full = (n) => fullFormat.format(n);

// Shows up to three dialing codes, e.g. "+44" or "+1, +1242".
export function callingCode(codes) {
  if (!codes?.length) return "—";
  return codes
    .slice(0, 3)
    .map((c) => (String(c).startsWith("+") ? c : `+${c}`))
    .join(", ");
}
