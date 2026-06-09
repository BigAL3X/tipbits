import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TipPage from "./TipPage";
import "./CreatorPage.css";

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
      <div className="cp-loading">
        <div className="cp-loading-inner">
          <div className="cp-loading-icon">⚡</div>
          <div className="cp-loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-error">
        <div className="cp-error-inner">
          <div className="cp-error-icon">⚡</div>
          <div className="cp-error-title">Page not found</div>
          <div className="cp-error-body">
            <strong>tipbits.xyz/u/{username}</strong> doesn't exist yet.<br />
            Want to claim it?
          </div>
          <button onClick={() => navigate('/register')} className="cp-error-claim-btn">
            ⚡ Claim this page
          </button>
          <div className="cp-error-back-wrap">
            <button onClick={() => navigate('/')} className="cp-error-back-btn">
              ← Back to TipBits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-root">
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
      <div className="cp-edit-footer">
        <button
          onClick={() => navigate('/edit')}
          className="cp-edit-btn"
          onMouseEnter={e => e.target.style.color="#9ca3af"}
          onMouseLeave={e => e.target.style.color="#d1d5db"}
        >
          ✏ Edit this page
        </button>
      </div>
    </div>
  );
}
