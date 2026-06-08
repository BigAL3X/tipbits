import { useState, useEffect, useRef, useCallback } from "react";
import { trackEvent } from "./analytics";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const CURRENCIES = [
  { code: "SATS", symbol: "⚡", label: "Sats" },
  { code: "GBP",  symbol: "£",  label: "GBP"  },
  { code: "USD",  symbol: "$",  label: "USD"  },
  { code: "EUR",  symbol: "€",  label: "EUR"  },
];

const PRESETS = {
  SATS: [1000, 5000, 21000, 100000],
  GBP:  [1, 5, 10, 21],
  USD:  [1, 5, 10, 21],
  EUR:  [1, 5, 10, 21],
};

const INVOICE_EXPIRY_MS = 10 * 60 * 1000;

function BitcoinLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

function LightningRain({ active, onDone }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth; const H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const bolts = Array.from({ length: 32 }, (_, i) => ({
      x: Math.random() * W, y: -40 - Math.random() * 180,
      speed: 4.5 + Math.random() * 7, size: 11 + Math.random() * 20,
      opacity: 0.55 + Math.random() * 0.45, rotation: -20 + Math.random() * 40,
      color: Math.random() > 0.4 ? "#F7931A" : "#fb923c", delay: i * 35,
    }));
    let startTime = null; const duration = 2400;
    const drawBolt = (ctx, x, y, size, opacity, rotation, color) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity; ctx.fillStyle = color; ctx.beginPath();
      const s = size;
      ctx.moveTo(s*0.4,0); ctx.lineTo(0,s*0.45); ctx.lineTo(s*0.3,s*0.45);
      ctx.lineTo(-s*0.1,s); ctx.lineTo(s*0.55,s*0.42); ctx.lineTo(s*0.25,s*0.42);
      ctx.lineTo(s*0.65,0); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      ctx.clearRect(0, 0, W, H);
      let allDone = true;
      bolts.forEach((b) => {
        if (elapsed < b.delay) { allDone = false; return; }
        b.y += b.speed;
        const fade = Math.min(1, (elapsed - b.delay) / 280);
        const fadeOut = b.y > H * 0.7 ? Math.max(0, 1 - (b.y - H*0.7)/(H*0.3)) : 1;
        if (b.y < H + b.size) { allDone = false; drawBolt(ctx, b.x, b.y, b.size, b.opacity * fade * fadeOut, b.rotation, b.color); }
      });
      if (elapsed < duration || !allDone) { animRef.current = requestAnimationFrame(animate); }
      else { ctx.clearRect(0, 0, W, H); onDone && onDone(); }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:10, borderRadius:16 }} />;
}

function PaidScreen({ satsAmount, memo, onReset }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);
  return (
    <div style={{ textAlign:"center", padding:"12px 0" }}>
      <div style={{ opacity:show?1:0, transform:show?"scale(1)":"scale(0.7)", transition:"opacity .5s cubic-bezier(.34,1.56,.64,1),transform .5s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:38, boxShadow:"0 8px 32px rgba(16,185,129,.35)" }}>⚡</div>
        <div style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:6 }}>Sats received!</div>
        <div style={{ fontSize:15, color:"#6b7280", marginBottom:20 }}>{satsAmount.toLocaleString()} sats landed peer-to-peer</div>
        {memo && <div style={{ display:"inline-block", padding:"8px 16px", background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:13, color:"#6b7280", fontStyle:"italic", marginBottom:20 }}>"{memo}"</div>}
        <div style={{ padding:"14px 18px", background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:12, fontSize:13, color:"#065f46", lineHeight:1.6, marginBottom:20 }}>
          Payment routed over the Lightning Network.<br />Non-custodial. No middleman. Peer-to-peer.
        </div>
        <button className="btn-primary" onClick={onReset} style={{ background:"#111827", boxShadow:"none" }}>Send another tip</button>
      </div>
    </div>
  );
}

// config: { creatorName, creatorHandle, creatorBio, lightningAddress }
// showSupportLink: show "Powered by TipBits" footer on creator pages
// showCreateCTA: show "Get your own page" on home page
export default function TipPage({ config, showSupportLink = false, showCreateCTA = false }) {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState("SATS");
  const [amount, setAmount] = useState(21000);
  const [customInput, setCustomInput] = useState("");
  const [memo, setMemo] = useState("");
  const [btcPrices, setBtcPrices] = useState({ GBP: null, USD: null, EUR: null });
  const [priceError, setPriceError] = useState(false);
  const [step, setStep] = useState("choose");
  const [invoice, setInvoice] = useState(null);
  const [verifyUrl, setVerifyUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [raining, setRaining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [canVerify, setCanVerify] = useState(false);

  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const expiryRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp,usd,eur")
      .then(r => r.json())
      .then(d => setBtcPrices({ GBP: d.bitcoin.gbp, USD: d.bitcoin.usd, EUR: d.bitcoin.eur }))
      .catch(() => setPriceError(true));
  }, []);

  useEffect(() => {
    if (step !== "invoice" || !verifyUrl) return;
    setCanVerify(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(verifyUrl);
        if (!res.ok) return;
        const data = await res.json();
        if (data.settled === true) {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setStep("paid");
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [step, verifyUrl]);

  useEffect(() => {
    if (step !== "invoice") return;
    expiryRef.current = Date.now() + INVOICE_EXPIRY_MS;
    setTimeLeft(INVOICE_EXPIRY_MS);
    timerRef.current = setInterval(() => {
      const remaining = expiryRef.current - Date.now();
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        clearInterval(pollRef.current);
        setTimeLeft(0);
        setStep("expired");
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const toSats = useCallback((val, cur) => {
    if (!val || isNaN(val)) return 0;
    if (cur === "SATS") return Math.round(val);
    const price = btcPrices[cur];
    if (!price) return 0;
    return Math.round((val / price) * 100_000_000);
  }, [btcPrices]);

  const cur = CURRENCIES.find(c => c.code === currency);
  const inputVal = customInput !== "" ? customInput : amount;
  const satsAmount = toSats(inputVal, currency);

  const fiatEquiv = useCallback((sats) => {
    if (!btcPrices.GBP || !sats) return null;
    const gbp = (sats / 100_000_000) * btcPrices.GBP;
    return gbp < 0.01 ? "<£0.01" : `≈ £${gbp.toFixed(2)}`;
  }, [btcPrices]);

  const handleCurrencyChange = (code) => {
    setCurrency(code); setCustomInput(""); setAmount(PRESETS[code][2]);
  };

  const fmtTimeLeft = (ms) => {
    if (ms === null) return "";
    const totalSecs = Math.ceil(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const generateInvoice = async () => {
    if (!satsAmount || satsAmount < 1) return;
    const address = config.lightningAddress.trim();
    if (!address || !address.includes("@")) {
      setError("No Lightning address configured for this page.");
      return;
    }
    setLoading(true); setRaining(true); setError(null); setVerifyUrl(null); setCanVerify(false);
    try {
      const [username, domain] = address.split("@");
      if (!username || !domain) throw new Error("Invalid Lightning address format.");
      const lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${encodeURIComponent(username)}`;
      const paramsRes = await fetch(`/api/lnurl-fetch?url=${encodeURIComponent(lnurlEndpoint)}`);
      if (!paramsRes.ok) throw new Error("Could not reach this Lightning address. It may be offline.");
      const params = await paramsRes.json();
      if (params.status === "ERROR") throw new Error(params.reason || "Lightning address returned an error.");
      if (!params.callback) throw new Error("Lightning address did not return a valid payment endpoint.");
      const milliSats = satsAmount * 1000;
      const min = params.minSendable ?? 1000;
      const max = params.maxSendable ?? 100_000_000_000;
      if (milliSats < min) throw new Error(`Minimum tip is ${Math.ceil(min / 1000).toLocaleString()} sats.`);
      if (milliSats > max) throw new Error(`Maximum tip is ${Math.floor(max / 1000).toLocaleString()} sats.`);
      const callbackUrl = new URL(params.callback);
      callbackUrl.searchParams.set("amount", String(milliSats));
      const prefix = "TipBits: ";
      const commentText = memo.trim() ? `${prefix}${memo.trim()}` : prefix.trim();
      callbackUrl.searchParams.set("comment", commentText.slice(0, 144));
      const invoiceRes = await fetch(`/api/lnurl-fetch?url=${encodeURIComponent(callbackUrl.toString())}`);
      if (!invoiceRes.ok) throw new Error("Failed to generate invoice. Please try again.");
      const invoiceData = await invoiceRes.json();
      if (invoiceData.status === "ERROR") throw new Error(invoiceData.reason || "Invoice generation failed.");
      if (!invoiceData.pr) throw new Error("No invoice returned. Please try again.");
      setInvoice(invoiceData.pr);
      if (invoiceData.verify) setVerifyUrl(invoiceData.verify);
      setStep("invoice");
      trackEvent("invoice_generated", { username: config.lightningAddress?.split("@")[0] ?? "", sats: satsAmount });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setRaining(false);
    } finally {
      setLoading(false);
    }
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const reset = () => {
    clearInterval(pollRef.current); clearInterval(timerRef.current);
    setStep("choose"); setInvoice(null); setVerifyUrl(null);
    setCustomInput(""); setMemo(""); setCopied(false);
    setError(null); setTimeLeft(null); setCanVerify(false);
  };

  // Back from invoice — keeps amount and memo so user doesn't have to re-enter
  const goBack = () => {
    clearInterval(pollRef.current); clearInterval(timerRef.current);
    setStep("choose"); setInvoice(null); setVerifyUrl(null);
    setCopied(false); setError(null); setTimeLeft(null); setCanVerify(false);
  };

  const presets = PRESETS[currency];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fff7ed 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'IBM Plex Sans',system-ui,sans-serif", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .tj-wrap{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease;}
        .tj-wrap.in{opacity:1;transform:translateY(0);}
        .cur-btn{flex:1;padding:9px 4px;background:white;border:1.5px solid #e5e7eb;color:#9ca3af;font-family:'IBM Plex Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;border-radius:8px;transition:all .14s ease;letter-spacing:.03em;}
        .cur-btn:hover{border-color:#F7931A;color:#F7931A;background:#fff7ed;}
        .cur-btn.active{background:#F7931A;border-color:#F7931A;color:white;font-weight:600;}
        .preset-btn{flex:1;padding:10px 4px;background:white;border:1.5px solid #e5e7eb;color:#6b7280;font-family:'IBM Plex Mono',monospace;font-size:12px;cursor:pointer;border-radius:8px;transition:all .14s ease;}
        .preset-btn:hover{border-color:#F7931A;color:#F7931A;background:#fff7ed;}
        .preset-btn.active{border-color:#F7931A;color:#F7931A;background:#fff7ed;font-weight:500;}
        .tj-input{width:100%;background:white;border:1.5px solid #e5e7eb;color:#111827;padding:12px 14px;border-radius:10px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;outline:none;transition:border-color .15s ease,box-shadow .15s ease;}
        .tj-input:focus{border-color:#F7931A;box-shadow:0 0 0 3px rgba(247,147,26,.12);}
        .tj-input::placeholder{color:#d1d5db;}
        .tj-input::-webkit-outer-spin-button,.tj-input::-webkit-inner-spin-button{-webkit-appearance:none;}
        .tj-label{font-size:11px;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;display:block;font-weight:500;}
        .btn-primary{width:100%;padding:15px;background:#F7931A;color:white;border:none;border-radius:12px;font-family:'IBM Plex Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:all .15s ease;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(247,147,26,.35);}
        .btn-primary:hover:not(:disabled){background:#e8840f;box-shadow:0 6px 20px rgba(247,147,26,.45);transform:translateY(-1px);}
        .btn-primary:active:not(:disabled){transform:translateY(0);}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed;box-shadow:none;}
        .btn-ghost{padding:11px 18px;background:white;color:#6b7280;border:1.5px solid #e5e7eb;border-radius:10px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .13s ease;}
        .btn-ghost:hover{border-color:#d1d5db;color:#374151;}
        .btn-copy{flex:2;padding:11px;background:white;border:1.5px solid #e5e7eb;border-radius:10px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .13s ease;color:#6b7280;font-weight:500;}
        .btn-copy:hover{border-color:#F7931A;color:#F7931A;background:#fff7ed;}
        .btn-copy.done{border-color:#10b981;color:#10b981;background:#f0fdf4;}
        .price-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:#fff7ed;border:1px solid #fed7aa;font-size:11px;color:#c2410c;font-weight:500;}
        .conversion-box{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;margin-bottom:20px;}
        .inv-string{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:12px;font-size:11px;color:#9ca3af;line-height:1.7;word-break:break-all;max-height:68px;overflow:hidden;position:relative;font-family:'IBM Plex Mono',monospace;}
        .inv-string::after{content:'';position:absolute;bottom:0;left:0;right:0;height:24px;background:linear-gradient(transparent,#f9fafb);}
        .divider{height:1px;background:#f3f4f6;margin:20px 0;}
        .spin{animation:spin .8s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block;animation:livepulse 2s ease-in-out infinite;}
        .live-dot.err{background:#ef4444;animation:none;}
        @keyframes livepulse{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse-dot{width:8px;height:8px;border-radius:50%;background:#F7931A;display:inline-block;animation:livepulse 1.2s ease-in-out infinite;}
        .success-ring{animation:ringpop .5s cubic-bezier(.34,1.56,.64,1) forwards;}
        @keyframes ringpop{0%{transform:scale(.7);opacity:0}100%{transform:scale(1);opacity:1}}
        .bg-dots{position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(circle,#f0901820 1px,transparent 1px);background-size:28px 28px;opacity:.5;}
        .nav-link{font-size:13px;color:#9ca3af;text-decoration:none;font-weight:500;padding:6px 12px;border-radius:8px;transition:all .13s ease;cursor:pointer;background:none;border:none;font-family:'IBM Plex Sans',sans-serif;}
        .nav-link:hover{color:#F7931A;background:#fff7ed;}
        .error-box{margin-top:12px;padding:12px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;font-size:13px;color:#b91c1c;line-height:1.5;}
        .timer-bar-wrap{height:4px;background:#f3f4f6;border-radius:2px;overflow:hidden;margin-bottom:16px;}
        .timer-bar{height:100%;border-radius:2px;transition:width 1s linear;}
        .create-cta{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;background:white;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;color:#6b7280;cursor:pointer;transition:all .13s ease;text-decoration:none;font-family:'IBM Plex Sans',sans-serif;font-weight:500;}
        .create-cta:hover{border-color:#F7931A;color:#F7931A;background:#fff7ed;}
        .support-link{font-size:11px;color:#d1d5db;text-decoration:none;transition:color .13s ease;font-family:'IBM Plex Sans',sans-serif;}
        .support-link:hover{color:#F7931A;}
      `}</style>

      <div className="bg-dots" />

      <div className={`tj-wrap ${mounted ? "in" : ""}`} style={{ width:"100%", maxWidth:430, position:"relative", zIndex:1 }}>

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <button onClick={() => navigate('/')} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", padding:0 }}>
            <BitcoinLogo size={28} />
            <span style={{ fontSize:16, fontWeight:700, color:"#111827", letterSpacing:"-0.02em" }}>TipBits</span>
          </button>
          <button className="nav-link" onClick={() => navigate('/how')}>How it works</button>
        </div>

        {/* Creator header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ marginBottom:12 }}><BitcoinLogo size={60} /></div>
          <div style={{ fontSize:28, fontWeight:700, color:"#111827", letterSpacing:"-0.02em", marginBottom:2 }}>
            {config.creatorName}
          </div>
          <div style={{ fontSize:13, color:"#9ca3af", marginBottom:8 }}>{config.creatorHandle}</div>
          {config.creatorBio && <div style={{ fontSize:14, color:"#6b7280", lineHeight:1.5, marginBottom:6 }}>{config.creatorBio}</div>}
          {config.creatorWebsite && (
            <a href={config.creatorWebsite} target="_blank" rel="noopener noreferrer"
              style={{ fontSize:13, color:"#F7931A", textDecoration:"none", fontWeight:500 }}>
              🔗 {config.creatorWebsite.replace(/^https?:\/\//, '')}
            </a>
          )}
          {btcPrices.GBP && (
            <div style={{ marginTop:10 }}>
              <span className="price-badge">
                <span className={`live-dot ${priceError ? "err" : ""}`} />
                BTC £{btcPrices.GBP?.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Main card */}
        <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"26px 24px", position:"relative", overflow:"hidden", boxShadow:"0 4px 32px rgba(0,0,0,.06),0 1px 4px rgba(0,0,0,.04)" }}>
          <LightningRain active={raining} onDone={() => setRaining(false)} />

          {step === "choose" && (<>
            <span className="tj-label">Currency</span>
            <div style={{ display:"flex", gap:6, marginBottom:20 }}>
              {CURRENCIES.map(c => (
                <button key={c.code} className={`cur-btn ${currency === c.code ? "active" : ""}`}
                  onClick={() => handleCurrencyChange(c.code)}>
                  {c.symbol} {c.label}
                </button>
              ))}
            </div>
            <span className="tj-label">Quick amounts</span>
            <div style={{ display:"flex", gap:6, marginBottom:18 }}>
              {presets.map(p => (
                <button key={p} className={`preset-btn ${!customInput && amount === p ? "active" : ""}`}
                  onClick={() => { setAmount(p); setCustomInput(""); setError(null); }}>
                  {currency === "SATS" ? p.toLocaleString() : `${cur.symbol}${p}`}
                </button>
              ))}
            </div>
            <span className="tj-label">Or enter amount</span>
            <div style={{ position:"relative", marginBottom:18 }}>
              {currency !== "SATS" && (
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:14, pointerEvents:"none" }}>{cur.symbol}</span>
              )}
              <input className="tj-input" type="number" placeholder="0" min="0"
                value={customInput}
                onChange={e => { setCustomInput(e.target.value); setError(null); }}
                style={{ paddingLeft: currency !== "SATS" ? 28 : 14 }} />
            </div>
            <span className="tj-label">Message (optional)</span>
            <textarea className="tj-input" placeholder="Leave a note..."
              value={memo} onChange={e => setMemo(e.target.value)}
              maxLength={144} rows={2} style={{ resize:"none", marginBottom:20, lineHeight:1.6 }} />
            <div className="conversion-box">
              <div>
                <div style={{ fontSize:11, color:"#9ca3af", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>You're sending</div>
                {currency !== "SATS" && <div style={{ fontSize:12, color:"#6b7280" }}>{cur.symbol}{(parseFloat(inputVal)||0).toFixed(2)} {currency}</div>}
                {currency === "SATS" && fiatEquiv(satsAmount) && <div style={{ fontSize:12, color:"#6b7280" }}>{fiatEquiv(satsAmount)}</div>}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:26, fontWeight:700, color:satsAmount>0?"#F7931A":"#d1d5db", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1 }}>
                  {satsAmount > 0 ? satsAmount.toLocaleString() : "0"}
                </div>
                <div style={{ fontSize:11, color:"#9ca3af", letterSpacing:"0.06em" }}>SATS</div>
              </div>
            </div>
            <button className="btn-primary" onClick={generateInvoice} disabled={loading || !satsAmount || satsAmount < 1}>
              {loading ? <><span className="spin">⚡</span> Generating invoice...</> : <>⚡ Generate Lightning Invoice</>}
            </button>
            {error && <div className="error-box">{error}</div>}
            <div style={{ marginTop:12, fontSize:11, color:"#9ca3af", textAlign:"center", lineHeight:1.6 }}>
              TipBits is in early access. Payments go peer-to-peer directly to the creator's wallet — we never hold funds. If you're new here, consider sending a small amount first to confirm everything works as expected.
            </div>
          </>)}

          {step === "invoice" && (<>
            <div style={{ textAlign:"center" }} className="success-ring">
              <span className="tj-label" style={{ marginBottom:12, display:"block" }}>Scan to pay</span>
              <div style={{ display:"inline-flex", padding:10, background:"white", border:"1.5px solid #e5e7eb", borderRadius:12, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                <QRCodeSVG value={invoice.toUpperCase()} size={200} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
              </div>
              <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:30, fontWeight:700, color:"#F7931A", fontFamily:"'IBM Plex Mono',monospace" }}>{satsAmount.toLocaleString()}</span>
                <span style={{ fontSize:13, color:"#9ca3af" }}>sats</span>
              </div>
              {currency !== "SATS" && <div style={{ fontSize:13, color:"#6b7280", marginBottom:3 }}>{cur.symbol}{parseFloat(inputVal).toFixed(2)} {currency}</div>}
              {currency === "SATS" && fiatEquiv(satsAmount) && <div style={{ fontSize:13, color:"#6b7280", marginBottom:3 }}>{fiatEquiv(satsAmount)}</div>}
              {memo && <div style={{ fontSize:13, color:"#9ca3af", fontStyle:"italic", marginTop:4 }}>"{memo}"</div>}
            </div>
            {timeLeft !== null && (
              <div style={{ marginTop:16 }}>
                <div className="timer-bar-wrap">
                  <div className="timer-bar" style={{ width:`${(timeLeft/INVOICE_EXPIRY_MS)*100}%`, background:timeLeft<60000?"#ef4444":timeLeft<180000?"#f59e0b":"#F7931A" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, color:"#9ca3af" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span className="pulse-dot" />
                    {canVerify ? "Watching for payment..." : "Scan or tap to pay"}
                  </span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace" }}>{fmtTimeLeft(timeLeft)} remaining</span>
                </div>
              </div>
            )}
            {!canVerify && (
              <button className="btn-primary" style={{ marginTop:16, background:"#10b981", boxShadow:"0 4px 16px rgba(16,185,129,.3)" }} onClick={() => setStep("paid")}>
                ✓ I've paid
              </button>
            )}
            <div className="divider" />
            <span className="tj-label">Payment request</span>
            <div className="inv-string">{invoice}</div>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button className="btn-ghost" onClick={goBack}>← Back</button>
              <button className={`btn-copy ${copied?"done":""}`} onClick={copyInvoice}>{copied?"✓ Copied!":"Copy Invoice"}</button>
            </div>
          </>)}

          {step === "paid" && <PaidScreen satsAmount={satsAmount} memo={memo} onReset={reset} />}

          {step === "expired" && (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <div style={{ fontSize:40, marginBottom:16 }}>⏱</div>
              <div style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>Invoice expired</div>
              <div style={{ fontSize:14, color:"#6b7280", marginBottom:24, lineHeight:1.6 }}>Lightning invoices expire after 10 minutes.<br />Generate a new one to try again.</div>
              <button className="btn-primary" onClick={reset}>Generate new invoice</button>
            </div>
          )}
        </div>

        {/* CTA / footer area */}
        <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
          {showCreateCTA && (
            <button className="create-cta" onClick={() => navigate('/register')}>
              ⚡ Get your own sovereign tip page →
            </button>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:11, color:"#d1d5db", letterSpacing:"0.06em", flexWrap:"wrap", justifyContent:"center" }}>
            <span>⚡ LIGHTNING NETWORK</span>
            <span>·</span>
            <span>NON-CUSTODIAL</span>
            <span>·</span>
            {showSupportLink ? (
              <a href="/" className="support-link" onClick={e => { e.preventDefault(); navigate('/'); }}>Powered by TipBits ⚡</a>
            ) : (
              <span>TIPBITS</span>
            )}
          </div>
          {showSupportLink && (
            <button
              onClick={() => navigate('/register')}
              style={{ background:"none", border:"none", color:"#F7931A", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Sans',sans-serif", padding:"4px 8px", letterSpacing:".01em" }}
            >
              ⚡ Get your own tip page →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
