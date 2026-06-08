import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BitcoinLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

const STEPS = [
  {
    n: "01",
    icon: "🔑",
    title: "Register with your Lightning address",
    body: "No email. No password. No KYC. Just your Lightning address and a Sovereign Key that only you hold. Takes under a minute.",
  },
  {
    n: "02",
    icon: "🔗",
    title: "Share your link anywhere",
    body: "Drop tipbits.xyz/u/yourname in your X bio, Nostr profile, Substack footer, YouTube description — anywhere your audience finds you.",
  },
  {
    n: "03",
    icon: "⚡",
    title: "Receive sats direct to your wallet",
    body: "Tippers pay over the Lightning Network. Sats go peer-to-peer straight to your wallet. TipBits never touches your money.",
  },
];

const TRUST = [
  { icon: "🔒", label: "Non-custodial", sub: "TipBits never holds your funds", bg: "#E1F5EE", color: "#0F6E56" },
  { icon: "🕵️", label: "No KYC", sub: "No identity checks. Ever.", bg: "#fff7ed", color: "#c2410c" },
  { icon: "📧", label: "No email required", sub: "No account. No inbox. No spam.", bg: "#E6F1FB", color: "#185FA5" },
  { icon: "🔑", label: "Sovereign Key", sub: "Only you hold your edit credential", bg: "#FAEEDA", color: "#854F0B" },
  { icon: "↔️", label: "Peer-to-peer", sub: "Lightning Network routing", bg: "#f0fdf4", color: "#166534" },
  { icon: "⚡", label: "Open standard", sub: "LNURL-pay. No vendor lock-in.", bg: "#fdf4ff", color: "#7e22ce" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp")
      .then(r => r.json())
      .then(d => setBtcPrice(d.bitcoin.gbp))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff7ed 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .land-wrap { opacity: 0; transform: translateY(16px); transition: opacity .55s ease, transform .55s ease; }
        .land-wrap.in { opacity: 1; transform: translateY(0); }
        .nav-link { font-size: 13px; color: #9ca3af; font-weight: 500; padding: 6px 12px; border-radius: 8px; transition: all .13s ease; cursor: pointer; background: none; border: none; font-family: 'IBM Plex Sans', sans-serif; }
        .nav-link:hover { color: #F7931A; background: #fff7ed; }
        .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 32px; background: #F7931A; color: white; border: none; border-radius: 14px; font-family: 'IBM Plex Sans', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; letter-spacing: .01em; transition: all .15s ease; box-shadow: 0 4px 20px rgba(247,147,26,.4); }
        .btn-primary:hover { background: #e8840f; box-shadow: 0 6px 28px rgba(247,147,26,.5); transform: translateY(-2px); }
        .btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 14px 24px; background: white; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 12px; font-family: 'IBM Plex Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all .13s ease; text-decoration: none; }
        .btn-ghost:hover { border-color: #F7931A; color: #F7931A; }
        .step-card { background: white; border: 1.5px solid #e5e7eb; border-radius: 16px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,.04); transition: box-shadow .15s, transform .15s; }
        .step-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.09); transform: translateY(-2px); }
        .trust-card { border-radius: 14px; padding: 18px 20px; }
        .demo-card { background: white; border: 1.5px solid #e5e7eb; border-radius: 20px; padding: 28px 24px; box-shadow: 0 8px 40px rgba(0,0,0,.08); max-width: 400px; width: 100%; }
        .bg-dots { position: fixed; inset: 0; pointer-events: none; background-image: radial-gradient(circle, #f0901820 1px, transparent 1px); background-size: 28px 28px; opacity: .5; }
        .price-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; background: #fff7ed; border: 1px solid #fed7aa; font-size: 11px; color: #c2410c; font-weight: 500; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block; animation: livepulse 2s ease-in-out infinite; }
        @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #F7931A; margin-bottom: 8px; }
      `}</style>

      <div className="bg-dots" />

      <div className={`land-wrap ${mounted ? "in" : ""}`} style={{ position: "relative", zIndex: 1 }}>

        {/* Nav */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BitcoinLogo size={32} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>TipBits</span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button className="nav-link" onClick={() => navigate('/how')}>How it works</button>
            <button className="nav-link" onClick={() => navigate('/learn')}>Learn</button>
            <button className="nav-link" onClick={() => navigate('/tip')}>Support ⚡</button>
            <button
              onClick={() => navigate('/register')}
              style={{ marginLeft: 8, padding: "8px 18px", background: "#F7931A", color: "white", border: "none", borderRadius: 10, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .13s" }}
            >
              Get your page
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 64px", display: "flex", alignItems: "center", gap: 64, flexWrap: "wrap" }}>

          {/* Left — copy */}
          <div style={{ flex: "1 1 360px" }}>
            <div className="section-label" style={{ marginBottom: 16 }}>Non-custodial Lightning tips</div>
            <h1 style={{ fontSize: 52, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
              Get paid in Bitcoin.<br />
              <span style={{ color: "#F7931A" }}>Peer-to-peer.</span>
            </h1>
            <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              Your sovereign tip page. Your Lightning address. Your sats.<br />
              No middleman. No account. No KYC. No custody.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn-primary" onClick={() => navigate('/register')}>
                ⚡ Claim your page — it's free
              </button>
              <button className="btn-ghost" onClick={() => navigate('/how')}>
                How it works →
              </button>
            </div>
            {btcPrice && (
              <div style={{ marginTop: 24 }}>
                <span className="price-badge">
                  <span className="live-dot" />
                  BTC £{btcPrice.toLocaleString()} live
                </span>
              </div>
            )}
          </div>

          {/* Right — live demo card */}
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div className="demo-card">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <BitcoinLogo size={52} />
                <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 10, marginBottom: 2 }}>Meridian</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>DownWithBigBother@primal.net</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>Bitcoin, monetary policy and geopolitics.</div>
              </div>

              {/* Mini amount selector */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {["⚡ Sats", "£ GBP", "$ USD", "€ EUR"].map((c, i) => (
                  <div key={c} style={{ flex: 1, padding: "7px 4px", background: i === 0 ? "#F7931A" : "white", border: `1.5px solid ${i === 0 ? "#F7931A" : "#e5e7eb"}`, borderRadius: 8, fontSize: 11, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "white" : "#9ca3af", textAlign: "center" }}>
                    {c}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {[1000, 5000, 21000, 100000].map((p, i) => (
                  <div key={p} style={{ flex: 1, padding: "8px 2px", background: i === 2 ? "#fff7ed" : "white", border: `1.5px solid ${i === 2 ? "#F7931A" : "#e5e7eb"}`, borderRadius: 8, fontSize: 11, color: i === 2 ? "#F7931A" : "#6b7280", textAlign: "center", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {p.toLocaleString()}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em" }}>You're sending</div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#F7931A", fontFamily: "'IBM Plex Mono', monospace" }}>21,000</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>SATS</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/tip')}
                style={{ width: "100%", padding: "13px", background: "#F7931A", color: "white", border: "none", borderRadius: 10, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(247,147,26,.35)" }}
              >
                ⚡ Try a real tip page →
              </button>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
              This is a live, working tip page. Click to try it.
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ background: "white", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", padding: "32px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {TRUST.map(t => (
                <div key={t.label} className="trust-card" style={{ background: t.bg, minWidth: 150, flex: "1 1 130px", maxWidth: 180 }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.color, marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: t.color, opacity: .8, lineHeight: 1.4 }}>{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works — 3 steps */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label">Simple by design</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Up and running in 60 seconds</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {STEPS.map(s => (
              <div key={s.n} className="step-card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F7931A", fontFamily: "'IBM Plex Mono', monospace" }}>{s.n}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8, lineHeight: 1.3 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>{s.body}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button className="btn-primary" style={{ fontSize: 17, padding: "18px 40px" }} onClick={() => navigate('/register')}>
              ⚡ Claim your sovereign tip page
            </button>
            <div style={{ marginTop: 14, fontSize: 13, color: "#9ca3af" }}>
              Free forever. No email. No credit card.
            </div>
          </div>
        </div>

        {/* What we store — transparency section */}
        <div style={{ background: "#0f172a", padding: "64px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#F7931A", marginBottom: 12 }}>Radical transparency</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: 16 }}>We store as little as possible. Here's exactly what.</h2>
            <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 36 }}>
              TipBits is non-custodial by design. We never hold your funds, never see your Sovereign Key, and never require an email address.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, textAlign: "left" }}>
              {[
                { label: "Username, name, handle, bio", note: "Shown publicly on your tip page" },
                { label: "Your Lightning address", note: "Public by design — used to generate invoices" },
                { label: "Hash of your Sovereign Key", note: "Not the key — we cannot recover it" },
              ].map(item => (
                <div key={item.label} style={{ background: "#1e293b", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{item.note}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: "14px 20px", background: "#1e293b", borderRadius: 12, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              No analytics. No tracking. No email marketing. No access to your wallet. No custody of your funds. Ever.
            </div>
          </div>
        </div>

        {/* Support section */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: 12 }}>
            Find value in TipBits?
          </h2>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
            TipBits is built and maintained by one person using the same tools you're using right now. If it's useful, throw some sats the creator's way.
          </p>
          <button
            className="btn-primary"
            style={{ fontSize: 16, padding: "16px 36px" }}
            onClick={() => navigate('/tip')}
          >
            ⚡ Support TipBits with sats
          </button>
          <div style={{ marginTop: 12, fontSize: 13, color: "#9ca3af" }}>
            Peer-to-peer. Non-custodial. Goes straight to the creator's wallet.
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "28px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BitcoinLogo size={22} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>TipBits</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#9ca3af" }}>
              <button className="nav-link" onClick={() => navigate('/how')}>How it works</button>
              <button className="nav-link" onClick={() => navigate('/learn')}>Learn</button>
              <button className="nav-link" onClick={() => navigate('/register')}>Get your page</button>
              <button className="nav-link" onClick={() => navigate('/edit')}>Edit my page</button>
              <button className="nav-link" onClick={() => navigate('/tip')}>Support ⚡</button>
              <button className="nav-link" onClick={() => navigate('/contact')}>Contact</button>
            </div>
            <div style={{ fontSize: 11, color: "#d1d5db", letterSpacing: ".06em" }}>
              ⚡ LIGHTNING · NON-CUSTODIAL · SOVEREIGN
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
