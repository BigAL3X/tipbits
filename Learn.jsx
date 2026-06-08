import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BitcoinLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

const TOPICS = [
  {
    slug: "what-is-bitcoin",
    icon: "₿",
    title: "What is Bitcoin?",
    desc: "Not a company. Not a stock. Not crypto in the altcoin sense. The real thing.",
    color: "#F7931A",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  {
    slug: "bitcoin-as-money",
    icon: "⚖️",
    title: "Bitcoin as Money",
    desc: "Money is a technology. Here's why Bitcoin is better money than anything that came before it.",
    color: "#0369a1",
    bg: "#e0f2fe",
    border: "#bae6fd",
  },
  {
    slug: "bitcoin-vs-cbdc",
    icon: "🏦",
    title: "Bitcoin vs CBDCs",
    desc: "Digital currency isn't one thing. The difference between Bitcoin and a CBDC is the difference between freedom and control.",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    slug: "what-is-lightning",
    icon: "⚡",
    title: "What is the Lightning Network?",
    desc: "Bitcoin's base layer is slow by design. Lightning fixes that — instant, near-zero-fee payments on top of Bitcoin.",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    slug: "why-creators",
    icon: "🎙️",
    title: "Why This Matters for Creators",
    desc: "Platforms decide who gets paid. Lightning payments are peer-to-peer. No platform. No permission. Your sats.",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
];

export default function Learn() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fff7ed 100%)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif", padding: "0 16px 64px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .learn-wrap{opacity:0;transform:translateY(16px);transition:opacity .55s ease,transform .55s ease;max-width:720px;margin:0 auto;}
        .learn-wrap.in{opacity:1;transform:translateY(0);}
        .nav-link{font-size:13px;color:#9ca3af;font-weight:500;padding:6px 12px;border-radius:8px;transition:all .13s ease;cursor:pointer;background:none;border:none;font-family:'IBM Plex Sans',sans-serif;}
        .nav-link:hover{color:#F7931A;background:#fff7ed;}
        .topic-card{background:white;border:1.5px solid #e5e7eb;border-radius:16px;padding:24px;cursor:pointer;transition:all .15s ease;display:flex;align-items:flex-start;gap:18px;box-shadow:0 2px 8px rgba(0,0,0,.04);}
        .topic-card:hover{box-shadow:0 6px 24px rgba(0,0,0,.09);transform:translateY(-2px);border-color:#F7931A;}
        .bg-dots{position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(circle,#f0901820 1px,transparent 1px);background-size:28px 28px;opacity:.5;}
      `}</style>

      <div className="bg-dots" />

      <div className={`learn-wrap ${mounted ? "in" : ""}`} style={{ position: "relative", zIndex: 1 }}>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate('/')}>
            <BitcoinLogo size={28} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>← Back</button>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#F7931A", marginBottom: 10 }}>Bitcoin is Money</div>
          <h1 style={{ fontSize: 38, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
            Start here if Bitcoin<br />is new to you.
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.75, maxWidth: 520 }}>
            Five short guides. No jargon. No hype. Just an honest explanation of what Bitcoin is, why it matters, and why the Lightning Network makes it useful for anyone who creates things on the internet.
          </p>
        </div>

        {/* Topic cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 56 }}>
          {TOPICS.map((t, i) => (
            <div key={t.slug} className="topic-card" onClick={() => navigate(`/learn/${t.slug}`)}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: t.bg, border: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {t.icon}
              </div>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#F7931A", fontFamily: "'IBM Plex Mono',monospace" }}>0{i + 1}</span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{t.title}</h2>
                </div>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{t.desc}</p>
              </div>
              <div style={{ fontSize: 18, color: "#d1d5db", flexShrink: 0, paddingTop: 14 }}>→</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: "#0f172a", borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#F7931A", marginBottom: 10 }}>Ready to get paid?</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 10, letterSpacing: "-0.01em" }}>Accept Bitcoin tips peer-to-peer</h3>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
            No email. No bank account. No permission needed. Your own sovereign tip page in under a minute.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{ padding: "14px 32px", background: "#F7931A", color: "white", border: "none", borderRadius: 12, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(247,147,26,.4)", transition: "all .15s ease" }}
          >
            ⚡ Create your TipBits page →
          </button>
        </div>

      </div>
    </div>
  );
}
