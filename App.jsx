import { useState, useEffect } from "react";
import TipBits from "./TipBits";
import HowItWorks from "./HowItWorks";

export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {
    const handler = (e) => setPage(e.detail);
    window.addEventListener("tipbits-nav", handler);
    return () => window.removeEventListener("tipbits-nav", handler);
  }, []);

  return page === "how" ? <HowItWorks /> : <TipBits />;
}
