import { useFavorites } from "../hooks/useFavorites";

export default function SaveButton({ code, name, variant = "icon" }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(code);

  const star = (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "full") {
    return (
      <button
        type="button"
        className={`btn btn-ghost${saved ? " is-saved" : ""}`}
        onClick={() => toggle(code)}
      >
        {star}
        {saved ? "Remove from saved" : "Save country"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`save${saved ? " is-saved" : ""}`}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={() => toggle(code)}
    >
      {star}
    </button>
  );
}
