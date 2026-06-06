import { BrowserRouter, Routes, Route } from "react-router-dom";
import TipBits from "./TipBits";
import HowItWorks from "./HowItWorks";
import Register from "./Register";
import Edit from "./Edit";
import CreatorPage from "./CreatorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TipBits />} />
        <Route path="/how" element={<HowItWorks />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/u/:username" element={<CreatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
