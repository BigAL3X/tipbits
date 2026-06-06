# TipBits — Claude Code Handoff Prompt

## Project overview

TipBits is a non-custodial Lightning Network tip page for creators. It is a React single-page app built with Vite, deployed on Netlify.

The core value proposition: creators register once with their own Lightning address. Tippers visit a personal tip page, pick an amount in SATS, GBP, USD, or EUR, and pay via Lightning. TipBits never holds funds — all payments are peer-to-peer over the Lightning Network.

## Current state

The project is scaffolded and working with a mocked invoice. The UI is complete. The following features are NOT yet implemented and need building:

1. Real LNURL-pay invoice generation (replacing the mock)
2. Real QR code rendering (replacing the canvas placeholder)
3. Invoice payment detection / confirmation polling

## Project structure

```
tipbits/
  src/
    main.jsx          # React entry point
    App.jsx           # Page router (home / how-it-works)
    TipBits.jsx       # Main tip page component
    HowItWorks.jsx    # Explainer page
  index.html
  vite.config.js
  package.json
  netlify.toml        # Build config + SPA redirects + security headers
  .env.example        # Environment variable template
  .gitignore
```

## Environment variables

```
VITE_LIGHTNING_ADDRESS   Creator's Lightning address (e.g. name@getalby.com)
VITE_CREATOR_NAME        Display name
VITE_CREATOR_HANDLE      Handle shown under the name
VITE_CREATOR_BIO         Short bio
```

Set these in `.env.local` for local dev, and in Netlify's environment variable settings for production.

## Task 1: Wire real LNURL-pay invoice generation

Replace the mock `generateInvoice` function in `TipBits.jsx`.

### How LNURL-pay works

1. A Lightning address like `name@getalby.com` maps to a LNURL-pay endpoint at:
   `https://getalby.com/.well-known/lnurlp/name`
   The general pattern is: `https://{domain}/.well-known/lnurlp/{username}`

2. GET that endpoint. It returns a JSON object with:
   - `callback`: the URL to request an invoice from
   - `minSendable`: minimum amount in millisatoshis
   - `maxSendable`: maximum amount in millisatoshis
   - `metadata`: creator info string

3. GET `{callback}?amount={millisatoshis}` (amount is sats * 1000).
   It returns: `{ pr: "lnbc..." }` where `pr` is the BOLT11 payment request string.

4. That `pr` string is the real invoice. Display it as a QR and offer copy.

### Implementation

Replace the mock section in `generateInvoice` with:

```javascript
const generateInvoice = async () => {
  if (!satsAmount || satsAmount < 1) return;
  setLoading(true);
  setRaining(true);
  setError(null);

  try {
    const address = CONFIG.lightningAddress;
    const [username, domain] = address.split("@");
    const lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${username}`;

    // Step 1: fetch LNURL-pay params
    const paramsRes = await fetch(lnurlEndpoint);
    if (!paramsRes.ok) throw new Error("Could not reach Lightning address");
    const params = await paramsRes.json();
    if (params.status === "ERROR") throw new Error(params.reason);

    const milliSats = satsAmount * 1000;
    if (milliSats < params.minSendable || milliSats > params.maxSendable) {
      throw new Error(`Amount must be between ${params.minSendable/1000} and ${params.maxSendable/1000} sats`);
    }

    // Step 2: request invoice
    const invoiceRes = await fetch(`${params.callback}?amount=${milliSats}`);
    if (!invoiceRes.ok) throw new Error("Failed to generate invoice");
    const invoiceData = await invoiceRes.json();
    if (invoiceData.status === "ERROR") throw new Error(invoiceData.reason);

    setInvoice(invoiceData.pr);
    setStep("invoice");
  } catch (err) {
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};
```

Also add an `error` state:
```javascript
const [error, setError] = useState(null);
```

And render it below the generate button:
```jsx
{error && (
  <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2",
    border: "1.5px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#b91c1c" }}>
    {error}
  </div>
)}
```

### CORS note

LNURL-pay endpoints are public APIs that support CORS. This fetch can be done directly from the browser — no proxy needed. If a specific Lightning provider blocks CORS, a Netlify function can be used as a thin proxy, but try direct fetch first.

## Task 2: Real QR code rendering

Replace the `QRCanvas` component with `qrcode.react`.

Install:
```bash
npm install qrcode.react
```

Replace the QRCanvas usage in the invoice step:
```jsx
import { QRCodeSVG } from 'qrcode.react';

// In the invoice step, replace <QRCanvas invoice={invoice} size={200} /> with:
<QRCodeSVG
  value={invoice}
  size={200}
  bgColor="#ffffff"
  fgColor="#1a1a1a"
  level="M"
  imageSettings={{
    src: "/bolt.svg",   // optional: put a bolt icon in /public/bolt.svg
    height: 36,
    width: 36,
    excavate: true,
  }}
/>
```

Add a simple bolt SVG to `/public/bolt.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F7931A">
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
</svg>
```

## Task 3: Payment confirmation (optional, next phase)

After the invoice is shown, poll the LNURL endpoint or use a WebSocket from the Lightning provider to detect when the invoice is paid.

Alby provides a WebSocket API for this. The flow:
1. After generating the invoice, extract the payment hash from the decoded BOLT11
2. Open a WebSocket to `wss://getalby.com/lnurlp/{username}/invoice/{paymentHash}/status`
3. On receipt of a `settled` event, transition to a `step === "paid"` success screen

This is provider-specific. Build it after confirming which Lightning provider the creator uses.

## Task 4: Netlify deployment checklist

1. Push project to a GitHub repo
2. Connect repo to Netlify (New site from Git)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify dashboard (Site settings > Environment variables):
   - VITE_LIGHTNING_ADDRESS
   - VITE_CREATOR_NAME
   - VITE_CREATOR_HANDLE
   - VITE_CREATOR_BIO
6. Deploy. The `netlify.toml` handles SPA redirects automatically.

## Design system notes

- Primary colour: `#F7931A` (Bitcoin orange)
- Font: IBM Plex Sans (UI), IBM Plex Mono (numbers/amounts)
- Background: warm cream `#fff7ed` to white gradient
- All monetary values display in IBM Plex Mono
- Currency conversion uses CoinGecko public API (no key required):
  `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp,usd,eur`
- Lightning rain animation fires on invoice generation — canvas-based, 32 bolts, 2.4s duration

## Multi-creator roadmap (future phase)

Currently TipBits is a single-creator page configured via env vars. The multi-creator architecture uses:
- A backend registry (Netlify functions + a database, or a simple JSON file for MVP)
- Routes like `/creator/:username` resolved via React Router
- Each creator's Lightning address stored server-side, never exposed in the bundle
- Registration form with email verification to prevent impersonation

Do not build this until the single-creator version is live and working.
