import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CountriesProvider } from "./context/CountriesProvider.jsx";
import { FavoritesProvider } from "./context/FavoritesProvider.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CountriesProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </CountriesProvider>
    </BrowserRouter>
  </StrictMode>,
);
