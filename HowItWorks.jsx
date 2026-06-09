import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./HowItWorks.css";

function BitcoinLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

const STEPS = [
  {
    icon: "🔑",
    title: "Creator registers once",
    body: "The creator signs up with a username and pastes their own Lightning address. This is an address they control entirely, from a wallet like Alby, Wallet of Satoshi, or their own node. TipBits stores the username-to-address mapping and nothing else.",
    tag: "For creators",
    tagColor: "#0F6E56",
    tagBg: "#E1F5EE",
  },
  {
    icon: "🔗",
    title: "A link is shared anywhere",
    body: "The creator gets a personal tip page at tipbits.com/username. They drop that link in their X bio, Substack footer, Nostr profile, or anywhere else. A QR code is also available to embed in posts or print.",
    tag: "Shareable",
    tagColor: "#854F0B",
    tagBg: "#FAEEDA",
  },
  {
    icon: "⚡",
    title: "Tipper visits and pays",
    body: "The tipper picks an amount in sats, GBP, USD, or EUR. TipBits converts to sats at the live BTC price and generates a Lightning invoice directly from the creator's own Lightning provider. No account needed for the tipper.",
    tag: "For tippers",
    tagColor: "#185FA5",
    tagBg: "#E6F1FB",
  },
  {
    icon: "🎯",
    title: "Sats go straight to the creator",
    body: "The payment routes peer-to-peer over the Lightning Network. TipBits never holds the funds, never sees the transaction, and has no access to the creator's wallet. The creator receives sats directly into their own wallet.",
    tag: "Non-custodial",
    tagColor: "#0F6E56",
    tagBg: "#E1F5EE",
  },
];

const FAQS = [
  {
    q: "Can TipBits steal my money or my tips?",
    a: "No. TipBits never holds any funds. The invoice is generated directly by your Lightning provider, not by TipBits. The payment routes over the Lightning Network peer-to-peer. TipBits has no private keys and no access to any wallet.",
  },
  {
    q: "What is a Lightning address?",
    a: "A Lightning address looks like an email address (e.g. yourname@getalby.com) but it is actually a pointer to your Lightning wallet. Anyone can send you bitcoin by paying to that address. You can get one free from Alby at getalby.com.",
  },
  {
    q: "What does TipBits actually store?",
    a: "Only your chosen username and your Lightning address. No passwords, no payment data, no private keys. You can delete your registration at any time.",
  },
  {
    q: "How do tippers know the payment goes to the right person?",
    a: "The Lightning invoice is generated live from the creator's Lightning address every time someone visits the tip page. The invoice cryptographically commits to the destination. Any Lightning wallet can verify this before paying.",
  },
  {
    q: "Do I need a Bitcoin wallet to tip someone?",
    a: "Yes, you need a Lightning wallet. Wallet of Satoshi and Phoenix are good mobile options. Any wallet that supports Lightning Network payments will work.",
  },
  {
    q: "Is there a fee?",
    a: "TipBits charges no platform fee. The Lightning Network may route small fees of a few satoshis depending on the payment path, but these are typically less than a fraction of a penny.",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  return (
    <div className="hiw-page-root">
      <div className="bg-dots" />

      <div className={`hiw-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <div className="hiw-nav">
          <div className="hiw-nav-brand">
            <BitcoinLogo size={28} />
            <span className="hiw-nav-brand-text">TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>
            ← Back to tip page
          </button>
        </div>

        {/* Hero */}
        <div className="hiw-hero">
          <div className="section-label">How it works</div>
          <h1 className="hiw-hero-h1">
            Peer-to-peer tips.<br/>No middleman. No custody.
          </h1>
          <p className="hiw-hero-p">
            TipBits is a directory and a payment page. It connects tippers to creators using the Lightning Network. Every satoshi goes directly from tipper to creator. TipBits never touches your money.
          </p>
        </div>

        {/* Trust badges */}
        <div className="hiw-trust-badges">
          {[
            { label:"Non-custodial", bg:"#E1F5EE", color:"#0F6E56", icon:"🔒" },
            { label:"No KYC required", bg:"#fff7ed", color:"#c2410c", icon:"🕵️" },
            { label:"Open Lightning standard", bg:"#E6F1FB", color:"#185FA5", icon:"⚡" },
            { label:"Peer-to-peer payments", bg:"#FAEEDA", color:"#854F0B", icon:"↔️" },
          ].map(b => (
            <span key={b.label} className="trust-badge" style={{ '--badge-bg': b.bg, '--badge-color': b.color }}>
              <span>{b.icon}</span> {b.label}
            </span>
          ))}
        </div>

        {/* Steps */}
        <div className="section-label hiw-steps-label">The process</div>
        {STEPS.map((s, i) => (
          <div key={i} className="step-card">
            <div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-card-tag" style={{ '--tag-color': s.tagColor, '--tag-bg': s.tagBg }}>
                {s.tag}
              </div>
            </div>
            <div className="step-card-body">
              <div className="step-card-num-row">
                <span className="step-card-num">0{i+1}</span>
                <h3 className="step-card-title">{s.title}</h3>
              </div>
              <p className="step-card-desc">{s.body}</p>
            </div>
          </div>
        ))}

        {/* Flow diagram */}
        <div className="hiw-flow-card">
          <div className="section-label hiw-flow-label">Money flow</div>
          <div className="hiw-flow-row">
            {[
              { label:"Tipper", sub:"Scans QR or opens link", color:"#185FA5", bg:"#E6F1FB" },
              null,
              { label:"Lightning Network", sub:"Peer-to-peer routing", color:"#854F0B", bg:"#FAEEDA" },
              null,
              { label:"Creator wallet", sub:"Sats arrive directly", color:"#0F6E56", bg:"#E1F5EE" },
            ].map((item, i) => {
              if (item === null) return (
                <div key={i} className="hiw-flow-arrow">→</div>
              );
              return (
                <div key={i} className="hiw-flow-item" style={{ '--flow-bg': item.bg, '--flow-color': item.color }}>
                  <div className="hiw-flow-item-label">{item.label}</div>
                  <div className="hiw-flow-item-sub">{item.sub}</div>
                </div>
              );
            })}
          </div>
          <div className="hiw-flow-note">
            TipBits sits outside this flow entirely. It only provides the page where the invoice is generated.
          </div>
        </div>

        {/* Getting started box */}
        <div className="hiw-get-started">
          <div className="hiw-get-started-eyebrow">Get started as a creator</div>
          <h3 className="hiw-get-started-h3">You need one thing: a Lightning address</h3>
          <p className="hiw-get-started-p">
            A Lightning address is a free, permanent address for receiving bitcoin. It looks like an email address. The simplest way to get one is through Alby at getalby.com. Once you have it, registration on TipBits takes under a minute.
          </p>
          <div className="hiw-wallet-links">
            {[
              { name:"Alby", url:"https://getalby.com", note:"Recommended for creators" },
              { name:"Wallet of Satoshi", url:"https://walletofsatoshi.com", note:"Easiest mobile option" },
              { name:"Phoenix", url:"https://phoenix.acinq.co", note:"Self-custodial mobile" },
            ].map(w => (
              <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer" className="hiw-wallet-link">
                <span>{w.name} ↗</span>
                <span className="hiw-wallet-link-sub">{w.note}</span>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="section-label hiw-faq-label">Common questions</div>
        <div className="hiw-faq-card">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item${i === FAQS.length - 1 ? " faq-item--last" : ""}`}>
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className={`faq-chevron ${openFaq === i ? "open" : ""}`}>⌄</span>
              </button>
              {openFaq === i && (
                <p className="faq-answer">{faq.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* New to Bitcoin CTA */}
        <div className="hiw-learn-cta">
          <div>
            <div className="hiw-learn-cta-title">New to Bitcoin?</div>
            <div className="hiw-learn-cta-sub">Five short guides — no jargon, no hype.</div>
          </div>
          <button onClick={() => navigate('/learn')} className="hiw-learn-cta-btn">
            Start here →
          </button>
        </div>

        {/* Footer */}
        <div className="hiw-footer">
          <span>⚡ LIGHTNING NETWORK</span>
          <span>·</span>
          <span>NON-CUSTODIAL</span>
          <span>·</span>
          <span>TIPBITS</span>
        </div>

      </div>
    </div>
  );
}
