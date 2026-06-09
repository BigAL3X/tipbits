import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./Edit.css";

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
  const [website, setWebsite] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");
  const [editError, setEditError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
      setWebsite(creatorData.website || "");
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
          website: website.trim(),
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

  const handleDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== username.toLowerCase()) {
      setDeleteError("Username doesn't match. Type it exactly to confirm.");
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const keyHash = await hashKey(sovereignKey.trim());
      const res = await fetch("/api/creator/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.toLowerCase().trim(), editKeyHash: keyHash }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setDeleteError(data.error || "Delete failed. Please try again.");
        return;
      }
      navigate("/");
    } catch {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-root">
      <div className="bg-dots" />

      <div className={`edit-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <div className="edit-nav">
          <div className="edit-nav-brand">
            <BitcoinLogo size={28} />
            <span className="edit-nav-brand-text">TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>← Home</button>
        </div>

        {step === "verify" && (
          <>
            <div className="edit-verify-hero">
              <div className="edit-verify-eyebrow">Edit your page</div>
              <h1 className="edit-verify-h1">Enter your Sovereign Key</h1>
              <p className="edit-verify-p">
                Your Sovereign Key was shown once when you registered. It's the only way to edit your page — TipBits doesn't store it and cannot recover it for you.
              </p>
            </div>

            <div className="edit-card">
              {verifyError && <div className="error-box">{verifyError}</div>}
              <form onSubmit={handleVerify}>
                <div className="field">
                  <label className="tj-label">Username</label>
                  <input className="tj-input" type="text" placeholder="your-username" value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase())} autoComplete="off" />
                </div>
                <div className="field" style={{ marginBottom: 28 }}>
                  <label className="tj-label">Sovereign Key</label>
                  <input className="tj-input tj-input--mono" type="text" placeholder="Paste your sovereign key"
                    value={sovereignKey} onChange={e => setSovereignKey(e.target.value)}
                    autoComplete="off" />
                  <div className="edit-key-hint">
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
            <div className="edit-hero">
              <div className="edit-hero-eyebrow">Editing: @{username}</div>
              <h1 className="edit-hero-h1">Update your page</h1>
              <p className="edit-hero-p">Changes go live immediately.</p>
            </div>

            <div className="edit-card">
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
                  <textarea className="tj-input" value={bio} onChange={e => setBio(e.target.value)} maxLength={200} rows={2} style={{ resize: "none", lineHeight: 1.6 }} />
                </div>
                <div className="field">
                  <label className="tj-label">Your website (optional)</label>
                  <input className="tj-input" type="url" placeholder="https://yoursite.com" value={website} onChange={e => setWebsite(e.target.value)} maxLength={200} />
                </div>

                <div className="field" style={{ marginBottom: 28 }}>
                  <label className="tj-label">Lightning address</label>
                  <input className="tj-input" type="text" value={lightningAddress} onChange={e => setLightningAddress(e.target.value)} />
                  <div className="edit-ln-hint">This is where your tips land. Update this if you change wallets.</div>
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "⚡ Save changes"}
                </button>
              </form>
            </div>

            {/* Danger zone */}
            <div className="edit-danger-wrap">
              <button
                onClick={() => { setShowDeleteZone(v => !v); setDeleteError(null); setDeleteConfirmText(""); }}
                className="edit-danger-toggle"
              >
                <div className="edit-danger-toggle-left">
                  <span className="edit-danger-icon">⚠️</span>
                  <span className="edit-danger-title">Danger zone</span>
                </div>
                <span className="edit-danger-toggle-arrow">{showDeleteZone ? "▲ Close" : "▼ Delete my page"}</span>
              </button>

              {showDeleteZone && (
                <div className="edit-danger-body">
                  <div className="edit-danger-body-text">
                    <strong>This is permanent.</strong> Deleting your page removes all your data from TipBits immediately.
                    Any links you've shared — in your bio, X profile, or anywhere else — will stop working and show a 404.
                    Your Lightning address and Sovereign Key are unaffected.
                  </div>
                  <div className="edit-danger-confirm-note">
                    To confirm, type your username <strong>{username}</strong> below.
                  </div>
                  {deleteError && (
                    <div className="edit-danger-error">
                      {deleteError}
                    </div>
                  )}
                  <input
                    className="tj-input edit-delete-input"
                    type="text"
                    placeholder={`Type "${username}" to confirm`}
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                  />
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`edit-delete-btn ${deleting ? "edit-delete-btn--disabled" : "edit-delete-btn--active"}`}
                  >
                    {deleting ? "Deleting..." : "🗑 Permanently delete my page"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {step === "done" && (
          <div className="edit-done">
            <div className="edit-done-icon">⚡</div>
            <h1 className="edit-done-h1">Page updated</h1>
            <p className="edit-done-p">
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
