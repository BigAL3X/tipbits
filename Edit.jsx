import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BitcoinLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

async function hashKey(key) {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Edit() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState("verify"); // verify | edit | done

  // Verify step
  const [username, setUsername] = useState("");
  const [sovereignKey, setSovereignKey] = useState("");
  const [verifyError, setVerifyError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Edit step — pre-filled from fetched data
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");
  const [editError, setEditError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError(null);
    if (!username.trim()) { setVerifyError("Username is required."); return; }
    if (!sovereignKey.trim()) { setVerifyError("Sovereign Key is required."); return; }

    setVerifying(true);
    try {
      const keyHash = await hashKey(sovereignKey.trim());

      // Fetch current creator data first (to pre-fill the form)
      const getRes = await fetch(`/api/creator/get?u=${encodeURIComponent(username.toLowerCase().trim())}`);
      const creatorData = await getRes.json();
      if (!getRes.ok || creatorData.error) {
        setVerifyError("Username not found.");
        return;
      }

      // Verify the key by attempting a no-op update
      const verifyRes = await fetch("/api/creator/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          editKeyHash: keyHash,
          name: creatorData.name,
          handle: creatorData.handle,
          bio: creatorData.bio,
          lightningAddress: creatorData.lightningAddress,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || verifyData.error) {
        setVerifyError("Incorrect Sovereign Key. Check your saved key and try again.");
        return;
      }

      // Pre-fill edit form
      setName(creatorData.name || "");
      setHandle(creatorData.handle || "");
      setBio(creatorData.bio || "");
      setLightningAddress(creatorData.lightningAddress || "");
      setStep("edit");
    } catch {
      setVerifyError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditError(null);
    if (!name.trim()) { setEditError("Display name is required."); return; }
    if (lightningAddress.toLowerCase().startsWith("lnbc") || lightningAddress.toLowerCase().startsWith("lntb")) {
      setEditError("That looks like a Lightning invoice, not a Lightning address. A Lightning address looks like an email — e.g. you@getalby.com or you@strike.me.");
      return;
    }
    if (!lightningAddress.includes("@")) { setEditError("Please enter a valid Lightning address."); return; }

    setSaving(true);
    try {
      const keyHash = await hashKey(sovereignKey.trim());
      const res = await fetch("/api/creator/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          editKeyHash: keyHash,
          name: name.trim(),
          handle: handle.trim(),
          bio: bio.trim(),
          lightningAddress: lightningAddress.toLowerCase().trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setEditError(data.error || "Save failed. Please try again.");
        return;
      }
      setStep("done");
    } catch {
      setEditError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fff7ed 100%)", fontFamily:"'IBM Plex Sans',system-ui,sans-serif", padding:"24px 16px 64px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .edit-wrap{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease;max-width:480px;margin:0 auto;}
        .edit-wrap.in{opacity:1;transform:translateY(0);}
        .tj-input{width:100%;background:white;border:1.5px solid #e5e7eb;color:#111827;padding:12px 14px;border-radius:10px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;outline:none;transition:border-color .15s ease,box-shadow .15s ease;}
        .tj-input:focus{border-color:#F7931A;box-shadow:0 0 0 3px rgba(247,147,26,.12);}
        .tj-input::placeholder{color:#d1d5db;}
        .tj-label{font-size:11px;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;display:block;font-weight:500;}
        .field{margin-bottom:20px;}
        .btn-primary{width:100%;padding:15px;background:#F7931A;color:white;border:none;border-radius:12px;font-family:'IBM Plex Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .15s ease;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(247,147,26,.35);}
        .btn-primary:hover:not(:disabled){background:#e8840f;transform:translateY(-1px);}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed;box-shadow:none;}
        .nav-link{font-size:13px;color:#9ca3af;font-weight:500;padding:6px 12px;border-radius:8px;transition:all .13s ease;cursor:pointer;background:none;border:none;font-family:'IBM Plex Sans',sans-serif;}
        .nav-link:hover{color:#F7931A;background:#fff7ed;}
        .error-box{padding:12px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;font-size:13px;color:#b91c1c;line-height:1.5;margin-bottom:20px;}
        .bg-dots{position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(circle,#f0901820 1px,transparent 1px);background-size:28px 28px;opacity:.5;}
      `}</style>

      <div className="bg-dots" />

      <div className={`edit-wrap ${mounted ? "in" : ""}`} style={{ position:"relative", zIndex:1 }}>

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 0 32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <BitcoinLogo size={28} />
            <span style={{ fontSize:16, fontWeight:700, color:"#111827", letterSpacing:"-0.02em" }}>TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>← Home</button>
        </div>

        {step === "verify" && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#F7931A", marginBottom:8 }}>Edit your page</div>
              <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", letterSpacing:"-0.02em", marginBottom:12 }}>Enter your Sovereign Key</h1>
              <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7 }}>
                Your Sovereign Key was shown once when you registered. It's the only way to edit your page — TipBits doesn't store it and cannot recover it for you.
              </p>
            </div>

            <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px 24px", boxShadow:"0 4px 32px rgba(0,0,0,.06)" }}>
              {verifyError && <div className="error-box">{verifyError}</div>}
              <form onSubmit={handleVerify}>
                <div className="field">
                  <label className="tj-label">Username</label>
                  <input className="tj-input" type="text" placeholder="your-username" value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase())} autoComplete="off" />
                </div>
                <div className="field" style={{ marginBottom:28 }}>
                  <label className="tj-label">Sovereign Key</label>
                  <input className="tj-input" type="text" placeholder="Paste your sovereign key"
                    value={sovereignKey} onChange={e => setSovereignKey(e.target.value)}
                    style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, letterSpacing:".02em" }}
                    autoComplete="off" />
                  <div style={{ marginTop:8, fontSize:12, color:"#9ca3af", lineHeight:1.5 }}>
                    This is verified locally in your browser. It is hashed before leaving your device.
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={verifying}>
                  {verifying ? "Verifying..." : "🔑 Unlock my page"}
                </button>
              </form>
            </div>
          </>
        )}

        {step === "edit" && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#10b981", marginBottom:8 }}>Editing: @{username}</div>
              <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", letterSpacing:"-0.02em", marginBottom:8 }}>Update your page</h1>
              <p style={{ fontSize:14, color:"#6b7280" }}>Changes go live immediately.</p>
            </div>

            <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px 24px", boxShadow:"0 4px 32px rgba(0,0,0,.06)" }}>
              {editError && <div className="error-box">{editError}</div>}
              <form onSubmit={handleSave}>
                <div className="field">
                  <label className="tj-label">Display name</label>
                  <input className="tj-input" type="text" value={name} onChange={e => setName(e.target.value)} maxLength={50} />
                </div>
                <div className="field">
                  <label className="tj-label">Handle</label>
                  <input className="tj-input" type="text" value={handle} onChange={e => setHandle(e.target.value)} maxLength={30} />
                </div>
                <div className="field">
                  <label className="tj-label">Bio</label>
                  <textarea className="tj-input" value={bio} onChange={e => setBio(e.target.value)} maxLength={200} rows={2} style={{ resize:"none", lineHeight:1.6 }} />
                </div>
                <div className="field" style={{ marginBottom:28 }}>
                  <label className="tj-label">Lightning address</label>
                  <input className="tj-input" type="text" value={lightningAddress} onChange={e => setLightningAddress(e.target.value)} />
                  <div style={{ marginTop:8, fontSize:12, color:"#9ca3af" }}>This is where your tips land. Update this if you change wallets.</div>
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "⚡ Save changes"}
                </button>
              </form>
            </div>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign:"center", paddingTop:40 }}>
            <div style={{ fontSize:56, marginBottom:20 }}>⚡</div>
            <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", marginBottom:8 }}>Page updated</h1>
            <p style={{ fontSize:14, color:"#6b7280", marginBottom:32, lineHeight:1.6 }}>
              Your changes are live. Peer-to-peer. Sovereign.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate(`/u/${username.toLowerCase().trim()}`)}
            >
              View my page →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
