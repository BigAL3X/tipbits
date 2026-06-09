import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./Register.css";

function BitcoinLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

// Generate a cryptographically random sovereign key in the browser
async function generateSovereignKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// SHA-256 hash of the key — only this goes to the server
async function hashKey(key) {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Register() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState("form"); // form | key | done

  // Form fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState(null); // null | checking | available | taken | invalid
  const [usernameMsg, setUsernameMsg] = useState("");

  // Sovereign key
  const [sovereignKey, setSovereignKey] = useState("");
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyDownloaded, setKeyDownloaded] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const checkUsername = useCallback(async (val) => {
    const clean = val.toLowerCase().trim();
    if (!clean) { setUsernameStatus(null); setUsernameMsg(""); return; }
    if (!/^[a-z0-9-]{3,30}$/.test(clean)) {
      setUsernameStatus("invalid");
      setUsernameMsg("3–30 characters. Letters, numbers, and hyphens only.");
      return;
    }
    setUsernameStatus("checking");
    setUsernameMsg("Checking availability...");
    try {
      const res = await fetch(`/api/creator/check?u=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.available) {
        setUsernameStatus("available");
        setUsernameMsg(`tipbits.xyz/u/${clean} is yours to claim`);
      } else {
        setUsernameStatus("taken");
        setUsernameMsg(data.error || "Username already taken. Choose another.");
      }
    } catch {
      setUsernameStatus(null);
      setUsernameMsg("Could not check availability");
    }
  }, []);

  const handleUsernameBlur = () => checkUsername(username);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!username || usernameStatus !== "available") {
      setFormError("Please choose an available username.");
      return;
    }
    if (!name.trim()) { setFormError("Display name is required."); return; }
    if (lightningAddress.toLowerCase().startsWith("lnbc") || lightningAddress.toLowerCase().startsWith("lntb")) {
      setFormError("That looks like a Lightning invoice, not a Lightning address. A Lightning address looks like an email — e.g. you@getalby.com or you@strike.me.");
      return;
    }
    if (!lightningAddress.includes("@")) {
      setFormError("Please enter a valid Lightning address (e.g. you@getalby.com).");
      return;
    }

    setSubmitting(true);
    try {
      const key = await generateSovereignKey();
      const keyHash = await hashKey(key);

      const res = await fetch("/api/creator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          name: name.trim(),
          handle: handle.trim() || `@${username.toLowerCase().trim()}`,
          bio: bio.trim(),
          lightningAddress: lightningAddress.toLowerCase().trim(),
          website: website.trim(),
          editKeyHash: keyHash,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setFormError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSovereignKey(key);
      setStep("key");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(sovereignKey).catch(() => {});
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2500);
  };

  const downloadKey = () => {
    const content = [
      "TipBits Sovereign Key",
      "======================",
      "",
      `Username:     ${username.toLowerCase().trim()}`,
      `Page URL:     https://tipbits.xyz/u/${username.toLowerCase().trim()}`,
      `Sovereign Key: ${sovereignKey}`,
      "",
      "Keep this safe. This is the only way to edit your TipBits page.",
      "TipBits does not store this key — only you have it.",
      "",
      "To edit your page: https://tipbits.xyz/edit",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tipbits-${username.toLowerCase().trim()}-sovereign-key.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setKeyDownloaded(true);
  };

  const pageUrl = `https://tipbits.xyz/u/${username.toLowerCase().trim()}`;

  return (
    <div className="page-root">
      <div className="bg-dots" />

      <div className={`reg-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <div className="reg-nav">
          <div className="reg-nav-brand">
            <BitcoinLogo size={28} />
            <span className="reg-nav-brand-text">TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>← Back</button>
        </div>

        {step === "form" && (
          <>
            {/* Hero */}
            <div className="reg-hero">
              <div className="reg-hero-eyebrow">Claim your page</div>
              <h1 className="reg-hero-h1">
                Your sovereign tip page.<br />Your Lightning address.<br />Your sats.
              </h1>
              <p className="reg-hero-p">
                No email. No password. No account. No KYC.<br />
                Just a page, a Lightning address, and a Sovereign Key that only you hold.
              </p>
            </div>

            {/* Trust badges */}
            <div className="reg-badges">
              {[
                { label:"Non-custodial", bg:"#E1F5EE", color:"#0F6E56" },
                { label:"No email required", bg:"#fff7ed", color:"#c2410c" },
                { label:"No KYC", bg:"#E6F1FB", color:"#185FA5" },
                { label:"Peer-to-peer", bg:"#FAEEDA", color:"#854F0B" },
              ].map(b => (
                <span key={b.label} className="badge" style={{ background: b.bg, color: b.color }}>⚡ {b.label}</span>
              ))}
            </div>

            {/* Form */}
            <div className="reg-card">
              {formError && <div className="error-box">{formError}</div>}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="tj-label">Username — your page URL</label>
                  <input
                    className={`tj-input ${usernameStatus === "available" ? "ok" : usernameStatus === "taken" || usernameStatus === "invalid" ? "err" : ""}`}
                    type="text"
                    placeholder="satoshi"
                    value={username}
                    onChange={e => { setUsername(e.target.value.toLowerCase()); setUsernameStatus(null); setUsernameMsg(""); }}
                    onBlur={handleUsernameBlur}
                    maxLength={30}
                    autoComplete="off"
                  />
                  {usernameMsg && (
                    <div className={`hint ${usernameStatus === "available" ? "ok" : usernameStatus === "checking" ? "checking" : "err"}`}>
                      {usernameStatus === "available" ? "✓ " : usernameStatus === "taken" || usernameStatus === "invalid" ? "✗ " : ""}{usernameMsg}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label className="tj-label">Display name</label>
                  <input className="tj-input" type="text" placeholder="Satoshi Nakamoto" value={name} onChange={e => setName(e.target.value)} maxLength={50} />
                </div>

                <div className="field">
                  <label className="tj-label">Handle (optional)</label>
                  <input className="tj-input" type="text" placeholder="@satoshi" value={handle} onChange={e => setHandle(e.target.value)} maxLength={30} />
                  <div className="hint checking">Shown under your name. Defaults to @username if left blank.</div>
                </div>

                <div className="field">
                  <label className="tj-label">Bio (optional)</label>
                  <textarea className="tj-input" placeholder="What do you create? Keep it short." value={bio} onChange={e => setBio(e.target.value)} maxLength={200} rows={2} style={{ resize: "none", lineHeight: 1.6 }} />
                </div>

                <div className="field">
                  <label className="tj-label">Your website (optional)</label>
                  <input className="tj-input" type="url" placeholder="https://yoursite.com" value={website} onChange={e => setWebsite(e.target.value)} maxLength={200} />
                  <div className="hint checking">Shown on your tip page so tippers can find your work.</div>
                </div>

                <div className="field" style={{ marginBottom: 28 }}>
                  <label className="tj-label">Your Lightning address</label>
                  <input
                    className="tj-input"
                    type="text"
                    placeholder="you@getalby.com"
                    value={lightningAddress}
                    onChange={e => setLightningAddress(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="hint checking">
                    This is where your tips land — peer-to-peer, direct to your wallet.<br />
                    Don't have one? Get a free Lightning address at{" "}
                    <a href="https://getalby.com" target="_blank" rel="noopener noreferrer">getalby.com</a>.
                  </div>
                </div>

                {/* What we store */}
                <div className="reg-store-box">
                  <div className="reg-store-box-title">What TipBits stores about you</div>
                  {[
                    ["Username, display name, handle, bio", "Shown publicly on your tip page"],
                    ["Your Lightning address", "Public by design — used to generate invoices for your tippers"],
                    ["A mathematical fingerprint of your Sovereign Key", "Not the key itself — we cannot recover it for you"],
                  ].map(([what, why]) => (
                    <div key={what} className="check-item">
                      <span className="check-item-icon">⚡</span>
                      <div><strong>{what}</strong><br /><span className="check-item-why">{why}</span></div>
                    </div>
                  ))}
                  <div className="reg-privacy-note">
                    No email. No password. No tracking. No analytics. No custody of your funds — ever.
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={submitting || usernameStatus !== "available"}>
                  {submitting ? "Registering..." : "⚡ Claim my sovereign page"}
                </button>
                <div className="reg-disclaimer">
                  TipBits is in early access and provided as-is. We are not responsible for failed transactions or losses. Always ask tippers to send a small test amount first to confirm your Lightning address is working correctly.
                </div>
              </form>
            </div>
          </>
        )}

        {step === "key" && (
          <>
            <div className="reg-key-hero">
              <div className="reg-key-eyebrow">You're live ⚡</div>
              <h1 className="reg-key-h1">
                One thing to do before you go
              </h1>
              <p className="reg-key-p">
                Your page is active. Save your Sovereign Key below — it's the only way to edit your page in the future.
              </p>
            </div>

            {/* Page URL */}
            <div className="reg-page-url-box">
              <div>
                <div className="reg-page-url-label">Your tip page</div>
                <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="reg-page-url-link">
                  {pageUrl} ↗
                </a>
              </div>
            </div>

            {/* Sovereign Key card */}
            <div className="reg-key-card">
              <div className="reg-key-card-header">
                <span className="reg-key-card-icon">🔑</span>
                <div>
                  <div className="reg-key-card-title">Your Sovereign Key</div>
                  <div className="reg-key-card-subtitle">Save this now — you won't see it again</div>
                </div>
              </div>

              <div className="key-box">{sovereignKey}</div>

              <div className="reg-key-actions">
                <button
                  onClick={copyKey}
                  className={`reg-key-copy-btn ${keyCopied ? "reg-key-copy-btn--done" : "reg-key-copy-btn--normal"}`}
                >
                  {keyCopied ? "✓ Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadKey}
                  className={`reg-key-copy-btn ${keyDownloaded ? "reg-key-copy-btn--done" : "reg-key-copy-btn--normal"}`}
                >
                  {keyDownloaded ? "✓ Saved!" : "⬇ Download .txt"}
                </button>
              </div>

              {/* Sovereign Key explanation */}
              <div className="reg-key-explain">
                <div className="reg-key-explain-title">What is a Sovereign Key?</div>
                <div className="reg-key-explain-p">
                  Your Sovereign Key is the only credential to your TipBits page. There is no password reset, no email recovery, and no support ticket that can unlock it — because we don't hold it.
                </div>
                <div className="reg-key-explain-p">
                  When you registered, your browser generated this key locally and sent only its mathematical fingerprint to our server. The raw key never left your device. Even we cannot see it.
                </div>
                <div className="reg-key-explain-p">
                  <strong>If you lose it:</strong> your tip page stays live and keeps receiving sats — but you won't be able to update your Lightning address, name, or bio. Treat it like a private key.
                </div>
                <div className="reg-key-explain-footer">
                  Your keys. Your page. Your sats.
                </div>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label className={`reg-confirm-label ${keySaved ? "reg-confirm-label--checked" : "reg-confirm-label--unchecked"}`}>
              <input
                type="checkbox"
                checked={keySaved}
                onChange={e => setKeySaved(e.target.checked)}
                className="reg-confirm-checkbox"
              />
              <span className="reg-confirm-text">
                I have saved my Sovereign Key in a safe place. I understand that TipBits cannot recover it for me.
              </span>
            </label>

            <button
              className="btn-primary"
              onClick={() => navigate(`/u/${username.toLowerCase().trim()}`)}
              disabled={!keySaved}
            >
              ⚡ Go to my tip page
            </button>

            <div className="reg-footer-copy">
              <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(`https://tipbits.xyz/edit`); }}>
                📋 Copy edit page link
              </button>
            </div>

            <div className="reg-footer-note">
              Edit your page any time at{" "}
              <a href="/edit" onClick={e => { e.preventDefault(); navigate('/edit'); }}>tipbits.xyz/edit</a>
              {" "}using your username + Sovereign Key.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
