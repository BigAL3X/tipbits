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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff7ed 100%)",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      padding: "0 16px 64px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .hiw-wrap { opacity:0; transform:translateY(16px); transition:opacity .55s ease,transform .55s ease; max-width:680px; margin:0 auto; }
        .hiw-wrap.in { opacity:1; transform:translateY(0); }
        .step-card { background:white; border:1.5px solid #e5e7eb; border-radius:16px; padding:24px; margin-bottom:16px; display:flex; gap:20px; align-items:flex-start; box-shadow:0 2px 12px rgba(0,0,0,.04); transition:box-shadow .15s ease,transform .15s ease; }
        .step-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.08); transform:translateY(-1px); }
        .step-icon { width:52px; height:52px; border-radius:14px; background:#fff7ed; border:1.5px solid #fed7aa; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
        .faq-item { border-bottom:1px solid #f3f4f6; }
        .faq-btn { width:100%; text-align:left; padding:18px 0; background:none; border:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-family:'IBM Plex Sans',sans-serif; font-size:15px; font-weight:500; color:#111827; gap:16px; }
        .faq-btn:hover { color:#F7931A; }
        .faq-answer { font-size:14px; color:#6b7280; line-height:1.7; padding-bottom:18px; }
        .faq-chevron { font-size:18px; color:#9ca3af; transition:transform .2s ease; flex-shrink:0; }
        .faq-chevron.open { transform:rotate(180deg); }
        .trust-badge { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:12px; font-size:13px; font-weight:500; }
        .nav-link { font-size:13px; color:#9ca3af; text-decoration:none; font-weight:500; padding:6px 12px; border-radius:8px; transition:all .13s ease; cursor:pointer; background:none; border:none; font-family:'IBM Plex Sans',sans-serif; }
        .nav-link:hover { color:#F7931A; background:#fff7ed; }
        .section-label { font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#F7931A; margin-bottom:8px; }
        .bg-dots { position:fixed; inset:0; pointer-events:none; background-image:radial-gradient(circle,#f0901820 1px,transparent 1px); background-size:28px 28px; opacity:.5; z-index:0; }
      `}</style>

      <div className="bg-dots" />

      <div className={`hiw-wrap ${mounted ? "in" : ""}`} style={{ position:"relative", zIndex:1 }}>

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 0 32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <BitcoinLogo size={28} />
            <span style={{ fontSize:16, fontWeight:700, color:"#111827", letterSpacing:"-0.02em" }}>TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>
            ← Back to tip page
          </button>
        </div>

        {/* Hero */}
        <div style={{ marginBottom:48 }}>
          <div className="section-label">How it works</div>
          <h1 style={{ fontSize:36, fontWeight:700, color:"#111827", letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:16 }}>
            Peer-to-peer tips.<br/>No middleman. No custody.
          </h1>
          <p style={{ fontSize:16, color:"#6b7280", lineHeight:1.7, maxWidth:520 }}>
            TipBits is a directory and a payment page. It connects tippers to creators using the Lightning Network. Every satoshi goes directly from tipper to creator. TipBits never touches your money.
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:48 }}>
          {[
            { label:"Non-custodial", bg:"#E1F5EE", color:"#0F6E56", icon:"🔒" },
            { label:"No KYC required", bg:"#fff7ed", color:"#c2410c", icon:"🕵️" },
            { label:"Open Lightning standard", bg:"#E6F1FB", color:"#185FA5", icon:"⚡" },
            { label:"Peer-to-peer payments", bg:"#FAEEDA", color:"#854F0B", icon:"↔️" },
          ].map(b => (
            <span key={b.label} className="trust-badge" style={{ background:b.bg, color:b.color }}>
              <span>{b.icon}</span> {b.label}
            </span>
          ))}
        </div>

        {/* Steps */}
        <div className="section-label" style={{ marginBottom:16 }}>The process</div>
        {STEPS.map((s, i) => (
          <div key={i} className="step-card">
            <div>
              <div className="step-icon">{s.icon}</div>
              <div style={{ marginTop:8, fontSize:11, fontWeight:600, letterSpacing:".06em", color:s.tagColor, background:s.tagBg, display:"inline-block", padding:"3px 8px", borderRadius:6 }}>
                {s.tag}
              </div>
            </div>
            <div style={{ paddingTop:2 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#F7931A", fontFamily:"'IBM Plex Mono',monospace" }}>
                  0{i+1}
                </span>
                <h3 style={{ fontSize:16, fontWeight:600, color:"#111827" }}>{s.title}</h3>
              </div>
              <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7 }}>{s.body}</p>
            </div>
          </div>
        ))}

        {/* Flow diagram */}
        <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px 24px", marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,.04)" }}>
          <div className="section-label" style={{ marginBottom:20 }}>Money flow</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"Tipper", sub:"Scans QR or opens link", color:"#185FA5", bg:"#E6F1FB" },
              null,
              { label:"Lightning Network", sub:"Peer-to-peer routing", color:"#854F0B", bg:"#FAEEDA" },
              null,
              { label:"Creator wallet", sub:"Sats arrive directly", color:"#0F6E56", bg:"#E1F5EE" },
            ].map((item, i) => {
              if (item === null) return (
                <div key={i} style={{ flex:1, textAlign:"center", fontSize:20, color:"#F7931A", fontWeight:700 }}>→</div>
              );
              return (
                <div key={i} style={{ flex:2, background:item.bg, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:item.color, marginBottom:4 }}>{item.label}</div>
                  <div style={{ fontSize:11, color:item.color, opacity:.8, lineHeight:1.4 }}>{item.sub}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:20, padding:"12px 16px", background:"#fff7ed", border:"1.5px solid #fed7aa", borderRadius:10, fontSize:13, color:"#92400e", textAlign:"center" }}>
            TipBits sits outside this flow entirely. It only provides the page where the invoice is generated.
          </div>
        </div>

        {/* Getting started box */}
        <div style={{ background:"#F7931A", borderRadius:16, padding:"28px 24px", marginBottom:48, color:"white" }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", opacity:.8, marginBottom:8 }}>Get started as a creator</div>
          <h3 style={{ fontSize:20, fontWeight:700, marginBottom:12, letterSpacing:"-0.01em" }}>You need one thing: a Lightning address</h3>
          <p style={{ fontSize:14, opacity:.9, lineHeight:1.7, marginBottom:20 }}>
            A Lightning address is a free, permanent address for receiving bitcoin. It looks like an email address. The simplest way to get one is through Alby at getalby.com. Once you have it, registration on TipBits takes under a minute.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            {[
              { name:"Alby", url:"https://getalby.com", note:"Recommended for creators" },
              { name:"Wallet of Satoshi", url:"https://walletofsatoshi.com", note:"Easiest mobile option" },
              { name:"Phoenix", url:"https://phoenix.acinq.co", note:"Self-custodial mobile" },
            ].map(w => (
              <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer" style={{
                background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)",
                borderRadius:10, padding:"10px 14px", textDecoration:"none", color:"white",
                fontSize:13, fontWeight:500, display:"flex", flexDirection:"column", gap:2,
                transition:"background .13s ease",
              }}>
                <span>{w.name} ↗</span>
                <span style={{ fontSize:11, opacity:.75 }}>{w.note}</span>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="section-label" style={{ marginBottom:8 }}>Common questions</div>
        <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"8px 24px", boxShadow:"0 2px 12px rgba(0,0,0,.04)" }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item" style={{ borderBottom: i === FAQS.length - 1 ? "none" : undefined }}>
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
        <div style={{ marginTop:40, padding:"20px 24px", background:"#fff7ed", border:"1.5px solid #fed7aa", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#92400e", marginBottom:3 }}>New to Bitcoin?</div>
            <div style={{ fontSize:13, color:"#9ca3af", lineHeight:1.5 }}>Five short guides — no jargon, no hype.</div>
          </div>
          <button
            onClick={() => navigate('/learn')}
            style={{ padding:"10px 20px", background:"#F7931A", color:"white", border:"none", borderRadius:10, fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}
          >
            Start here →
          </button>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:40, fontSize:11, color:"#d1d5db", letterSpacing:"0.06em" }}>
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
