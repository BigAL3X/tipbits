import TipPage from "./TipPage";

const CONFIG = {
  creatorName: import.meta.env.VITE_CREATOR_NAME || "Meridian",
  creatorHandle: import.meta.env.VITE_CREATOR_HANDLE || "@meridian",
  creatorBio: import.meta.env.VITE_CREATOR_BIO || "Bitcoin. Monetary policy. Geopolitics. Sovereign living.",
  lightningAddress: import.meta.env.VITE_LIGHTNING_ADDRESS || "",
};

export default function TipBits() {
  return <TipPage config={CONFIG} showCreateCTA />;
}
