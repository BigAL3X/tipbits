import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./Learn.css";
import { IconBolt, IconBitcoin, IconScale, IconBank, IconMic } from "./Icons.jsx";

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
    icon: <IconBitcoin size={24} />,
    title: "What is Bitcoin?",
    desc: "Not a company. Not a stock. Not crypto in the altcoin sense. The real thing.",
    color: "#F7931A",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  {
    slug: "bitcoin-as-money",
    icon: <IconScale size={24} />,
    title: "Bitcoin as Money",
    desc: "Money is a technology. Here's why Bitcoin is better money than anything that came before it.",
    color: "#0369a1",
    bg: "#e0f2fe",
    border: "#bae6fd",
  },
  {
    slug: "bitcoin-vs-cbdc",
    icon: <IconBank size={24} />,
    title: "Bitcoin vs CBDCs",
    desc: "Digital currency isn't one thing. The difference between Bitcoin and a CBDC is the difference between freedom and control.",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    slug: "what-is-lightning",
    icon: <IconBolt size={24} />,
    title: "What is the Lightning Network?",
    desc: "Bitcoin's base layer is slow by design. Lightning fixes that — instant, near-zero-fee payments on top of Bitcoin.",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    slug: "why-creators",
    icon: <IconMic size={24} />,
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
    <div className="learn-page-root">
      <div className="bg-dots" />

      <div className={`learn-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <div className="learn-nav">
          <div className="learn-nav-brand" onClick={() => navigate('/')}>
            <BitcoinLogo size={28} />
            <span className="learn-nav-brand-text">TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>← Back</button>
        </div>

        {/* Hero */}
        <div className="learn-hero">
          <div className="learn-hero-eyebrow">Bitcoin is Money</div>
          <h1 className="learn-hero-h1">
            Start here if Bitcoin<br />is new to you.
          </h1>
          <p className="learn-hero-p">
            Five short guides. No jargon. No hype. Just an honest explanation of what Bitcoin is, why it matters, and why the Lightning Network makes it useful for anyone who creates things on the internet.
          </p>
        </div>

        {/* Topic cards */}
        <div className="learn-topics">
          {TOPICS.map((t, i) => (
            <div key={t.slug} className="topic-card" onClick={() => navigate(`/learn/${t.slug}`)}>
              <div className="topic-icon" style={{ '--icon-bg': t.bg, '--icon-border': t.border, '--icon-color': t.color }}>
                {t.icon}
              </div>
              <div className="topic-body">
                <div className="topic-title-row">
                  <span className="topic-num">0{i + 1}</span>
                  <h2 className="topic-title">{t.title}</h2>
                </div>
                <p className="topic-desc">{t.desc}</p>
              </div>
              <div className="topic-arrow">→</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="learn-cta">
          <div className="learn-cta-eyebrow">Ready to get paid?</div>
          <h3 className="learn-cta-h3">Accept Bitcoin tips peer-to-peer</h3>
          <p className="learn-cta-p">
            No email. No bank account. No permission needed. Your own sovereign tip page in under a minute.
          </p>
          <button className="learn-cta-btn" onClick={() => navigate('/register')}>
            <IconBolt size={15} /> Create your TipBits page →
          </button>
        </div>

      </div>
    </div>
  );
}
