import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TipPage from "./TipPage";

export default function CreatorPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) { navigate('/'); return; }
    fetch(`/api/creator/get?u=${encodeURIComponent(username.toLowerCase())}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); }
        else { setCreator(data); }
      })
      .catch(() => setError("Could not load this page. Please try again."))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'IBM Plex Sans',system-ui,sans-serif", background:"linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fff7ed 100%)" }}>
        <div style={{ textAlign:"center", color:"#9ca3af" }}>
          <div style={{ fontSize:32, marginBottom:12, animation:"spin .8s linear infinite", display:"inline-block" }}>⚡</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          <div style={{ fontSize:14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'IBM Plex Sans',system-ui,sans-serif", background:"linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fff7ed 100%)", padding:"24px" }}>
        <div style={{ textAlign:"center", maxWidth:380 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
          <div style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:8 }}>Page not found</div>
          <div style={{ fontSize:14, color:"#6b7280", marginBottom:24, lineHeight:1.6 }}>
            <strong>tipbits.xyz/u/{username}</strong> doesn't exist yet.<br />
            Want to claim it?
          </div>
          <button
            onClick={() => navigate('/register')}
            style={{ padding:"12px 24px", background:"#F7931A", color:"white", border:"none", borderRadius:10, fontFamily:"'IBM Plex Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}
          >
            ⚡ Claim this page
          </button>
          <div style={{ marginTop:12 }}>
            <button onClick={() => navigate('/')} style={{ background:"none", border:"none", color:"#9ca3af", fontSize:13, cursor:"pointer", fontFamily:"'IBM Plex Sans',sans-serif" }}>
              ← Back to TipBits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"relative" }}>
      <TipPage
        config={{
          creatorName: creator.name,
          creatorHandle: creator.handle,
          creatorBio: creator.bio,
          creatorWebsite: creator.website || "",
          lightningAddress: creator.lightningAddress,
        }}
        showSupportLink
        pageUrl={`https://tipbits.xyz/u/${username}`}
      />
      <div style={{ textAlign:"center", paddingBottom:24, marginTop:-8 }}>
        <button
          onClick={() => navigate('/edit')}
          style={{ background:"none", border:"none", color:"#d1d5db", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Sans',system-ui,sans-serif", padding:"6px 12px", borderRadius:6, transition:"color .13s ease" }}
          onMouseEnter={e => e.target.style.color="#9ca3af"}
          onMouseLeave={e => e.target.style.color="#d1d5db"}
        >
          ✏ Edit this page
        </button>
      </div>
    </div>
  );
}
