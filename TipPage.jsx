import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./TipPage.css";
import { IconBolt, IconLink, IconQR, IconCheck, IconX, IconClock, IconDownload, IconPrinter } from "./Icons.jsx";

const CURRENCIES = [
  { code: "SATS", symbol: null, label: "Sats" },
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
  return <canvas ref={canvasRef} className="tj-lightning-canvas" />;
}

function PaidScreen({ satsAmount, memo, onReset }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);
  return (
    <div className="tj-paid-root">
      <div className={`tj-paid-anim ${show ? "tj-paid-anim--shown" : "tj-paid-anim--hidden"}`}>
        <div className="tj-paid-icon"><IconBolt size={36} /></div>
        <div className="tj-paid-title">Sats received!</div>
        <div className="tj-paid-subtitle">{satsAmount.toLocaleString()} sats landed peer-to-peer</div>
        {memo && <div className="tj-paid-memo">"{memo}"</div>}
        <div className="tj-paid-note">
          Payment routed over the Lightning Network.<br />Non-custodial. No middleman. Peer-to-peer.
        </div>
        <button className="btn-primary btn-primary--dark" onClick={onReset}>Send another tip</button>
      </div>
    </div>
  );
}

// config: { creatorName, creatorHandle, creatorBio, lightningAddress }
// showSupportLink: show "Powered by TipBits" footer on creator pages
// showCreateCTA: show "Get your own page" on home page
export default function TipPage({ config, showSupportLink = false, showCreateCTA = false, pageUrl = null }) {
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
  const qrCanvasRef = useRef(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    const load = () =>
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp,usd,eur")
        .then(r => r.json())
        .then(d => setBtcPrices({ GBP: d.bitcoin.gbp, USD: d.bitcoin.usd, EUR: d.bitcoin.eur }))
        .catch(() => setPriceError(true));
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
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

  const downloadQR = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const handle = (config.creatorHandle || "creator").replace(/^@/, "");
    const a = document.createElement("a");
    a.href = url;
    a.download = `tipbits-${handle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const printQR = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const imgSrc = canvas.toDataURL("image/png");
    const win = window.open("", "_blank", "width=620,height=780");
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>TipBits QR — ${config.creatorName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'IBM Plex Sans',sans-serif;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:48px 32px;text-align:center;color:#111827;}
    .logo-wrap{display:flex;align-items:center;gap:10px;margin-bottom:28px;}
    .brand{font-size:22px;font-weight:700;letter-spacing:-0.02em;}
    .brand span{color:#F7931A;}
    .name{font-size:17px;font-weight:600;color:#374151;margin-bottom:24px;}
    .qr-box{border:2px solid #e5e7eb;border-radius:16px;padding:16px;display:inline-block;margin-bottom:20px;background:white;}
    .qr-box img{display:block;width:280px;height:280px;}
    .url{font-family:'IBM Plex Mono',monospace;font-size:13px;color:#6b7280;word-break:break-all;max-width:340px;margin-bottom:28px;}
    .tagline{font-size:12px;color:#9ca3af;letter-spacing:.04em;}
    @media print{body{min-height:auto;justify-content:flex-start;padding-top:40px;}}
  </style>
</head>
<body>
  <div class="logo-wrap">
    <svg width="38" height="38" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="#F7931A"/><path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/></svg>
    <div class="brand">Tip<span>Bits</span> ⚡</div>
  </div>
  <div class="name">${config.creatorName}</div>
  <div class="qr-box"><img src="${imgSrc}" alt="QR code for ${pageUrl}" /></div>
  <div class="url">${pageUrl}</div>
  <div class="tagline">SCAN TO SEND LIGHTNING TIPS &nbsp;·&nbsp; NON-CUSTODIAL &nbsp;·&nbsp; TIPBITS.XYZ</div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`);
    win.document.close();
  };

  const presets = PRESETS[currency];

  // Dynamic timer bar color (computed at runtime)
  const timerBarColor = timeLeft < 60000 ? "#ef4444" : timeLeft < 180000 ? "#f59e0b" : "#F7931A";

  return (
    <div className="tj-page-root">
      <div className="bg-dots" />

      <div className={`tj-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <div className="tj-nav">
          <button onClick={() => navigate('/')} className="tj-nav-brand">
            <BitcoinLogo size={28} />
            <span className="tj-nav-brand-text">TipBits</span>
          </button>
          <button className="nav-link" onClick={() => navigate('/how')}>How it works</button>
        </div>

        {/* Creator header */}
        <div className="tj-creator-header">
          <div className="tj-creator-logo"><BitcoinLogo size={60} /></div>
          <div className="tj-creator-name">{config.creatorName}</div>
          <div className="tj-creator-handle">{config.creatorHandle}</div>
          {config.creatorBio && <div className="tj-creator-bio">{config.creatorBio}</div>}
          {config.creatorWebsite && (() => {
            try {
              const p = new URL(config.creatorWebsite);
              if (p.protocol !== 'https:' && p.protocol !== 'http:') return null;
              return (
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="tj-creator-website">
                  <IconLink size={13} /> {p.href.replace(/^https?:\/\//, '')}
                </a>
              );
            } catch { return null; }
          })()}
          {btcPrices.GBP && (
            <div className="tj-creator-price">
              <span className="price-badge">
                <span className={`live-dot ${priceError ? "err" : ""}`} />
                {/* key re-mounts the span on price change, triggering the roll-in tick */}
                <span key={btcPrices.GBP} className="price-tick">BTC £{btcPrices.GBP?.toLocaleString()}</span>
              </span>
            </div>
          )}
          {pageUrl && (
            <div className="tj-creator-qr-wrap">
              <button className="qr-show-btn" onClick={() => setShowQR(true)}>
                <IconQR size={14} /> Show QR
              </button>
            </div>
          )}
        </div>

        {/* Main card */}
        <div className="tj-main-card">
          <LightningRain active={raining} onDone={() => setRaining(false)} />

          {step === "choose" && (<>
            <span className="tj-label">Currency</span>
            <div className="tj-currency-row">
              {CURRENCIES.map(c => (
                <button key={c.code} className={`cur-btn ${currency === c.code ? "active" : ""}`}
                  onClick={() => handleCurrencyChange(c.code)}>
                  {c.code === "SATS" ? <IconBolt size={12} /> : c.symbol} {c.label}
                </button>
              ))}
            </div>
            <span className="tj-label">Quick amounts</span>
            <div className="tj-presets-row">
              {presets.map(p => (
                <button key={p} className={`preset-btn ${!customInput && amount === p ? "active" : ""}`}
                  onClick={() => { setAmount(p); setCustomInput(""); setError(null); }}>
                  {currency === "SATS" ? p.toLocaleString() : `${cur.symbol}${p}`}
                </button>
              ))}
            </div>
            <span className="tj-label">Or enter amount</span>
            <div className="tj-amount-wrap">
              {currency !== "SATS" && (
                <span className="tj-currency-symbol">{cur.symbol}</span>
              )}
              <input className={`tj-input ${currency !== "SATS" ? "tj-input-indent" : "tj-input-noindent"}`} type="number" placeholder="0" min="0"
                inputMode="decimal" enterKeyHint="done"
                value={customInput}
                onChange={e => { setCustomInput(e.target.value); setError(null); }} />
            </div>
            <span className="tj-label">Message (optional)</span>
            <textarea className="tj-input tj-memo" placeholder="Leave a note..."
              enterKeyHint="done"
              value={memo} onChange={e => setMemo(e.target.value)}
              maxLength={144} rows={2} />
            <div className="conversion-box">
              <div>
                <div className="tj-sending-label">You're sending</div>
                {currency !== "SATS" && <div className="tj-sending-fiat">{cur.symbol}{(parseFloat(inputVal)||0).toFixed(2)} {currency}</div>}
                {currency === "SATS" && fiatEquiv(satsAmount) && <div className="tj-sending-fiat">{fiatEquiv(satsAmount)}</div>}
              </div>
              <div>
                <div className={`tj-sats-amount ${satsAmount > 0 ? "tj-sats-amount--active" : "tj-sats-amount--zero"}`}>
                  {satsAmount > 0 ? satsAmount.toLocaleString() : "0"}
                </div>
                <div className="tj-sats-unit">SATS</div>
              </div>
            </div>
            <button className="btn-primary" onClick={generateInvoice} disabled={loading || !satsAmount || satsAmount < 1}>
              {loading
                ? <><span className="bolt-spin"><IconBolt size={16} /></span> Generating invoice...</>
                : <><IconBolt size={16} /> Generate Lightning Invoice</>}
            </button>
            {error && <div className="error-box">{error}</div>}
            <div className="tj-disclaimer">
              TipBits is in early access. Payments go peer-to-peer directly to the creator's wallet — we never hold funds. If you're new here, consider sending a small amount first to confirm everything works as expected.
            </div>
          </>)}

          {step === "invoice" && (<div className="expand-in">
            <div className="tj-invoice-center success-ring">
              <span className="tj-label tj-label--qr">Scan to pay</span>
              <div className="tj-qr-box">
                <QRCodeSVG value={invoice.toUpperCase()} size={200} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
              </div>
              <div className="tj-sats-big">
                <span className="tj-sats-big-num">{satsAmount.toLocaleString()}</span>
                <span className="tj-sats-big-unit">sats</span>
              </div>
              {currency !== "SATS" && <div className="tj-invoice-fiat">{cur.symbol}{parseFloat(inputVal).toFixed(2)} {currency}</div>}
              {currency === "SATS" && fiatEquiv(satsAmount) && <div className="tj-invoice-fiat">{fiatEquiv(satsAmount)}</div>}
              {memo && <div className="tj-invoice-memo">"{memo}"</div>}
            </div>
            {timeLeft !== null && (
              <div className="tj-timer-wrap">
                <div className="timer-bar-wrap">
                  <div className="timer-bar" style={{ '--timer-w': `${(timeLeft/INVOICE_EXPIRY_MS)*100}%`, '--timer-color': timerBarColor }} />
                </div>
                <div className="tj-timer-row">
                  <span className="tj-timer-status">
                    <span className="pulse-dot" />
                    {canVerify ? "Watching for payment..." : "Scan or tap to pay"}
                  </span>
                  <span className="tj-timer-countdown">{fmtTimeLeft(timeLeft)} remaining</span>
                </div>
              </div>
            )}
            {!canVerify && (
              <button className="btn-primary btn-primary--green" onClick={() => setStep("paid")}>
                <IconCheck size={15} /> I've paid
              </button>
            )}
            <div className="divider" />
            <span className="tj-label">Payment request</span>
            <div className="inv-string">{invoice}</div>
            <div className="tj-invoice-actions">
              <button className="btn-ghost" onClick={goBack}>← Back</button>
              <button className={`btn-copy ${copied ? "done" : ""}`} onClick={copyInvoice}>{copied ? <><IconCheck size={13} /> Copied!</> : "Copy Invoice"}</button>
            </div>
          </div>)}

          {step === "paid" && <PaidScreen satsAmount={satsAmount} memo={memo} onReset={reset} />}

          {step === "expired" && (
            <div className="tj-expired-root">
              <div className="tj-expired-icon"><IconClock size={40} /></div>
              <div className="tj-expired-title">Invoice expired</div>
              <div className="tj-expired-body">Lightning invoices expire after 10 minutes.<br />Generate a new one to try again.</div>
              <button className="btn-primary" onClick={reset}>Generate new invoice</button>
            </div>
          )}
        </div>

        {/* CTA / footer area */}
        <div className="tj-footer">
          {showCreateCTA && (
            <button className="create-cta" onClick={() => navigate('/register')}>
              <IconBolt size={13} /> Get your own sovereign tip page →
            </button>
          )}
          <div className="tj-footer-meta">
            <span className="tj-footer-bolt"><IconBolt size={11} /> LIGHTNING NETWORK</span>
            <span>·</span>
            <span>NON-CUSTODIAL</span>
            <span>·</span>
            {showSupportLink ? (
              <a href="/" className="support-link" onClick={e => { e.preventDefault(); navigate('/'); }}>Powered by TipBits</a>
            ) : (
              <span>TIPBITS</span>
            )}
          </div>
          {showSupportLink && (
            <button className="tj-get-page-btn" onClick={() => navigate('/register')}>
              <IconBolt size={12} /> Get your own tip page →
            </button>
          )}
        </div>
      </div>

      {showQR && pageUrl && (
        <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal-card" onClick={e => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={() => setShowQR(false)}><IconX size={12} /></button>

            <div className="qr-modal-label">Share this page</div>
            <div className="qr-modal-creator-name">{config.creatorName}</div>

            <div className="qr-modal-qr-box">
              <QRCodeSVG value={pageUrl} size={220} bgColor="#ffffff" fgColor="#1a1a1a" level="H" />
            </div>

            <div className="qr-modal-url">{pageUrl}</div>

            <div className="qr-modal-actions">
              <button className="btn-ghost btn-ghost--icon" onClick={downloadQR}><IconDownload size={13} /> Download PNG</button>
              <button className="btn-ghost btn-ghost--icon" onClick={printQR}><IconPrinter size={13} /> Print QR</button>
            </div>

            {/* Hidden 512px canvas for download and print */}
            <div className="qr-modal-hidden-canvas">
              <QRCodeCanvas ref={qrCanvasRef} value={pageUrl} size={512} bgColor="#ffffff" fgColor="#1a1a1a" level="H" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
