import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import TipBits from "./TipBits";
import HowItWorks from "./HowItWorks";
import Register from "./Register";
import Edit from "./Edit";
import Contact from "./Contact";
import CreatorPage from "./CreatorPage";
import Admin from "./Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/tip" element={<TipBits />} />
        <Route path="/how" element={<HowItWorks />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/u/:username" element={<CreatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
