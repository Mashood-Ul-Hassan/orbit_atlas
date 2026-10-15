import { useCallback, useEffect, useMemo, useState } from "react";
import { FavoritesContext } from "./favoritesContext";

const STORAGE_KEY = "orbit-atlas:saved";

function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Keeps the list of saved country codes and remembers it in the browser.
export function FavoritesProvider({ children }) {
  const [saved, setSaved] = useState(readSaved);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Storage can be blocked (private mode); the app still works without it.
    }
  }, [saved]);

  const toggle = useCallback((code) => {
    setSaved((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    );
  }, []);

  const clear = useCallback(() => setSaved([]), []);

  const value = useMemo(
    () => ({ saved, toggle, clear, isSaved: (code) => saved.includes(code) }),
    [saved, toggle, clear],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
