import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import TipBits from "./TipBits";
import HowItWorks from "./HowItWorks";
import Register from "./Register";
import Edit from "./Edit";
import Contact from "./Contact";
import CreatorPage from "./CreatorPage";
import Admin from "./Admin";
import Learn from "./Learn";
import LearnArticle from "./LearnArticle";

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
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<LearnArticle />} />
        <Route path="/u/:username" element={<CreatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
