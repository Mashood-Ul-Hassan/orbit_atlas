import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CountryDetail from "./pages/CountryDetail";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Saved from "./pages/Saved";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="countries" element={<Explore />} />
        <Route path="country/:code" element={<CountryDetail />} />
        <Route path="saved" element={<Saved />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
