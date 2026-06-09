import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./Landing.css";

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
    <div className="land-page-root">
      <div className="bg-dots" />

      <div className={`land-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <nav className="land-nav">
          <div className="land-nav-brand">
            <BitcoinLogo size={32} />
            <span className="land-nav-brand-text">TipBits</span>
          </div>
          <div className="land-nav-links">
            <button className="nav-link" onClick={() => navigate('/how')}>How it works</button>
            <button className="nav-link" onClick={() => navigate('/learn')}>Learn</button>
            <button className="nav-link" onClick={() => navigate('/tip')}>Support ⚡</button>
            <button className="land-nav-cta" onClick={() => navigate('/register')}>
              Get your page
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="land-hero">

          {/* Left — copy */}
          <div className="land-hero-copy">
            <div className="section-label land-hero-eyebrow">Non-custodial Lightning tips</div>
            <h1 className="land-hero-h1">
              Get paid in Bitcoin.<br />
              <span className="land-hero-h1-accent">Peer-to-peer.</span>
            </h1>
            <p className="land-hero-p">
              Your sovereign tip page. Your Lightning address. Your sats.<br />
              No middleman. No account. No KYC. No custody.
            </p>
            <div className="land-hero-btns">
              <button className="btn-primary" onClick={() => navigate('/register')}>
                ⚡ Claim your page — it's free
              </button>
              <button className="btn-ghost" onClick={() => navigate('/how')}>
                How it works →
              </button>
            </div>
            {btcPrice && (
              <div className="land-hero-price">
                <span className="price-badge">
                  <span className="live-dot" />
                  BTC £{btcPrice.toLocaleString()} live
                </span>
              </div>
            )}
          </div>

          {/* Right — live demo card */}
          <div className="land-hero-demo">
            <div className="demo-card">
              <div className="demo-card-header">
                <BitcoinLogo size={52} />
                <div className="demo-card-name">Meridian</div>
                <div className="demo-card-handle">DownWithBigBother@primal.net</div>
                <div className="demo-card-bio">Bitcoin, monetary policy and geopolitics.</div>
              </div>

              {/* Mini amount selector */}
              <div className="demo-card-currencies">
                {["⚡ Sats", "£ GBP", "$ USD", "€ EUR"].map((c, i) => (
                  <div key={c} className={`demo-card-currency ${i === 0 ? "demo-card-currency--active" : "demo-card-currency--inactive"}`}>
                    {c}
                  </div>
                ))}
              </div>

              <div className="demo-card-presets">
                {[1000, 5000, 21000, 100000].map((p, i) => (
                  <div key={p} className={`demo-card-preset ${i === 2 ? "demo-card-preset--active" : "demo-card-preset--inactive"}`}>
                    {p.toLocaleString()}
                  </div>
                ))}
              </div>

              <div className="demo-card-amount">
                <div className="demo-card-amount-label">You're sending</div>
                <div className="demo-card-amount-value">
                  <span className="demo-card-amount-num">21,000</span>
                  <span className="demo-card-amount-unit">SATS</span>
                </div>
              </div>

              <button className="demo-card-cta" onClick={() => navigate('/tip')}>
                ⚡ Try a real tip page →
              </button>
            </div>
            <div className="land-hero-demo-sub">
              This is a live, working tip page. Click to try it.
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="land-trust">
          <div className="land-trust-inner">
            <div className="land-trust-cards">
              {TRUST.map(t => (
                <div key={t.label} className="trust-card" style={{ '--card-bg': t.bg, '--card-color': t.color }}>
                  <div className="trust-card-icon">{t.icon}</div>
                  <div className="trust-card-label">{t.label}</div>
                  <div className="trust-card-sub">{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works — 3 steps */}
        <div className="land-steps">
          <div className="land-steps-header">
            <div className="section-label">Simple by design</div>
            <h2 className="land-steps-h2">Up and running in 60 seconds</h2>
          </div>
          <div className="land-steps-grid">
            {STEPS.map(s => (
              <div key={s.n} className="step-card">
                <div className="step-card-header">
                  <span className="step-card-icon">{s.icon}</span>
                  <span className="step-card-num">{s.n}</span>
                </div>
                <div className="step-card-title">{s.title}</div>
                <div className="step-card-body">{s.body}</div>
              </div>
            ))}
          </div>

          <div className="land-steps-cta">
            <button className="btn-primary land-steps-cta-btn" onClick={() => navigate('/register')}>
              ⚡ Claim your sovereign tip page
            </button>
            <div className="land-steps-cta-sub">
              Free forever. No email. No credit card.
            </div>
          </div>
        </div>

        {/* What we store — transparency section */}
        <div className="land-transparency">
          <div className="land-transparency-inner">
            <div className="land-transparency-eyebrow">Radical transparency</div>
            <h2 className="land-transparency-h2">We store as little as possible. Here's exactly what.</h2>
            <p className="land-transparency-p">
              TipBits is non-custodial by design. We never hold your funds, never see your Sovereign Key, and never require an email address.
            </p>
            <div className="land-transparency-grid">
              {[
                { label: "Username, name, handle, bio", note: "Shown publicly on your tip page" },
                { label: "Your Lightning address", note: "Public by design — used to generate invoices" },
                { label: "Hash of your Sovereign Key", note: "Not the key — we cannot recover it" },
              ].map(item => (
                <div key={item.label} className="land-transparency-item">
                  <div className="land-transparency-item-label">{item.label}</div>
                  <div className="land-transparency-item-note">{item.note}</div>
                </div>
              ))}
            </div>
            <div className="land-transparency-footer">
              No analytics. No tracking. No email marketing. No access to your wallet. No custody of your funds. Ever.
            </div>
          </div>
        </div>

        {/* Support section */}
        <div className="land-support">
          <div className="land-support-icon">⚡</div>
          <h2 className="land-support-h2">
            Find value in TipBits?
          </h2>
          <p className="land-support-p">
            TipBits is built and maintained by one person using the same tools you're using right now. If it's useful, throw some sats the creator's way.
          </p>
          <button className="btn-primary land-support-btn" onClick={() => navigate('/tip')}>
            ⚡ Support TipBits with sats
          </button>
          <div className="land-support-sub">
            Peer-to-peer. Non-custodial. Goes straight to the creator's wallet.
          </div>
        </div>

        {/* Footer */}
        <footer className="land-footer">
          <div className="land-footer-inner">
            <div className="land-footer-brand">
              <BitcoinLogo size={22} />
              <span className="land-footer-brand-text">TipBits</span>
            </div>
            <div className="land-footer-links">
              <button className="nav-link" onClick={() => navigate('/how')}>How it works</button>
              <button className="nav-link" onClick={() => navigate('/learn')}>Learn</button>
              <button className="nav-link" onClick={() => navigate('/register')}>Get your page</button>
              <button className="nav-link" onClick={() => navigate('/edit')}>Edit my page</button>
              <button className="nav-link" onClick={() => navigate('/tip')}>Support ⚡</button>
              <button className="nav-link" onClick={() => navigate('/contact')}>Contact</button>
            </div>
            <div className="land-footer-meta">
              ⚡ LIGHTNING · NON-CUSTODIAL · SOVEREIGN
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
