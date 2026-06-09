# TipBits — Claude Code Guide

## Project location

```
/Users/alexholmes/Desktop/Claude/TipBits
```

Always start Claude Code sessions from this directory. The Git remote is `https://github.com/BigAL3X/tipbits.git` (branch: `main`). Netlify auto-deploys from `main` at `tipbits.netlify.app` and the custom domain `tipbits.xyz`.

---

## Project overview

TipBits is a React/Vite SPA deployed on Netlify. Creators register a Lightning address and get a public tip page (`/u/:username`). The backend runs on Netlify Functions.

## Styling rules (strictly enforced)

### No inline styles — ever

Do not write `style={{ ... }}` props on JSX elements. All styling goes in plain `.css` files.

**Static values** → CSS classes:
```jsx
// ✗ Bad
<div style={{ marginBottom: 28 }}>

// ✓ Good
<div className="field--mb">
```

**Data-driven colors** (from arrays/objects) → CSS custom properties:
```jsx
// ✗ Bad
<span style={{ background: b.bg, color: b.color }}>

// ✓ Good
<span className="badge" style={{ '--badge-bg': b.bg, '--badge-color': b.color }}>
// CSS: .badge { background: var(--badge-bg); color: var(--badge-color); }
```

**Dynamic computed values** (widths, heights from state/calculations) → CSS custom properties:
```jsx
// ✗ Bad
<div style={{ width: `${pct}%`, background: color }} />

// ✓ Good
<div className="progress-bar" style={{ '--bar-w': pct + '%', '--bar-color': color }} />
// CSS: .progress-bar { width: var(--bar-w); background: var(--bar-color); }
```

The only acceptable use of `style=` is `style={{ '--var': value }}` (CSS custom properties only).

### No `<style>` blocks in JSX

Never write `<style>{`...`}</style>` inside component render. Move CSS into a `.css` file.

### CSS file conventions

- One `.css` file per component, named to match: `TipPage.css`, `Register.css`, etc.
- Import at the top of the component: `import './TipPage.css'`
- Shared/global styles go in `global.css`, imported in `main.jsx`
- Use BEM-ish class names consistent with what's already in each component (e.g. `.tj-wrap`, `.adm-stat-card`, `.reg-card`)

## Content Security Policy

`netlify.toml` enforces a strict CSP. The current `style-src` is:
```
style-src 'self' https://fonts.googleapis.com
```
**`'unsafe-inline'` must not be added back.** The CSS custom property pattern above is what makes dynamic styling work without it.

## Build

```bash
npm run build   # Vite production build — must pass before committing
npm run dev     # Dev server
```

---

## Architecture

### Frontend routes (`App.jsx`)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `TipBits.jsx` | Home tip page (demo creator) |
| `/register` | `Register.jsx` | Creator registration flow |
| `/edit` | `Edit.jsx` | Edit or delete a creator profile |
| `/u/:username` | `CreatorPage.jsx` | Public tip page for a creator |
| `/how` | `HowItWorks.jsx` | Explainer page |
| `/learn` | `Learn.jsx` | Article index |
| `/learn/:slug` | `LearnArticle.jsx` | Individual article |
| `/contact` | `Contact.jsx` | Contact page |
| `/admin` | `Admin.jsx` | Analytics dashboard (password-protected) |

### Netlify Functions (`netlify/functions/`)

| Function file | Path | Method | Purpose |
|---------------|------|--------|---------|
| `creator-register.js` | `/api/creator/register` | POST | Register new creator |
| `creator-check.js` | `/api/creator/check` | GET `?u=` | Username availability check |
| `creator-get.js` | `/api/creator/get` | GET `?u=` | Fetch public creator data |
| `creator-update.js` | `/api/creator/update` | POST | Update creator profile |
| `creator-delete.js` | `/api/creator/delete` | POST | Delete creator profile |
| `lnurl-fetch.js` | `/api/lnurl-fetch` | GET `?url=` | SSRF-safe proxy for LNURL-pay flows |
| `analytics-data.js` | `/api/events/data` | GET | Admin analytics (Bearer-token protected) |

### Data storage

Netlify Blobs is used as the key-value store. Two stores:
- `creators` — keyed by `username`, stores creator JSON objects
- `analytics` — keyed by `day:YYYY-MM-DD`, stores event arrays

---

## Sovereign Key authentication model

TipBits has **no user accounts and no passwords**. Instead:

1. On registration the browser generates 32 cryptographically random bytes (`crypto.getRandomValues`) and renders them as a 64-char hex string — the **Sovereign Key**.
2. The browser hashes the key with SHA-256 (`crypto.subtle.digest`). Only the **hash** (`editKeyHash`) is sent to and stored on the server. The raw key is never transmitted or persisted.
3. To edit or delete, the creator pastes their saved key. The browser hashes it again and sends the hash; the server compares with `timingSafeEqual`.
4. If the key is lost, the profile cannot be edited or deleted — there is no recovery mechanism by design.

**Implication for future work:** never add a "forgot key" flow that bypasses this model. It would break the sovereignty guarantee.

---

## Security model and hardening decisions

These decisions were made deliberately — do not revert them.

### SSRF protection in `lnurl-fetch`
The proxy resolves the target hostname via DNS and rejects any private/internal IP (RFC1918, loopback, link-local, IANA-reserved). This prevents an attacker from supplying a malicious Lightning address that points to internal Netlify infrastructure or cloud metadata endpoints (e.g. `169.254.169.254`).

Only `/.well-known/lnurlp/` and `/lnurlp/` paths are allowed for the initial lookup. Callback URLs (which carry `?amount=`) are also subject to the DNS/IP check.

### Website URL validation
Creator `website` fields are validated server-side in both `creator-register` and `creator-update` to allow only `http://` and `https://` schemes. `TipPage.jsx` also validates the scheme client-side before placing the URL in an `href`, preventing `javascript:` XSS.

### Admin authentication
`/api/events/data` requires an `Authorization: Bearer <token>` header matched against the `ADMIN_PASSWORD` environment variable. The password must **never** be passed as a URL query parameter — it would appear in Netlify function logs, CDN edge logs, and browser history.

`Admin.jsx` sends the header via `fetch(..., { headers: { Authorization: 'Bearer ...' } })`.

### Timing-safe key comparison
`creator-update` and `creator-delete` use `crypto.timingSafeEqual` (Node built-in) to compare `editKeyHash` values. Do not replace this with `===` or `!==`.

### CSP — `unsafe-inline` is banned
See the **Styling rules** section above. The CSP in `netlify.toml` does not include `'unsafe-inline'` for `style-src`. All dynamic styling must use CSS custom properties (`--var: value`) — not inline `style` objects with plain values.

### HSTS
`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` is set in `netlify.toml`. Do not remove or shorten the `max-age`.

---

## Security headers (netlify.toml)

| Header | Value | Why |
|--------|-------|-----|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years; eligible for browser preload list |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables sensitive browser APIs |
| `Content-Security-Policy` | see `netlify.toml` | Defence-in-depth against XSS |
| `frame-ancestors 'none'` | (inside CSP) | Redundant with X-Frame-Options; belt-and-braces |

---

## Session log

### Session — 2026-06-09 — QR Code Generator

**Goal:** Add a shareable QR code to every creator tip page.

**Files changed:**
- `TipPage.jsx` — added `pageUrl` prop; `QRCodeCanvas` imported alongside existing `QRCodeSVG`; `showQR` state + `qrCanvasRef`; `downloadQR()` and `printQR()` functions; "▣ Show QR" pill button in creator header (renders only when `pageUrl` is set); QR modal (fixed overlay, blur backdrop, close on backdrop click or ✕ button); CSS for modal added to embedded `<style>` block
- `CreatorPage.jsx` — passes `pageUrl={\`https://tipbits.xyz/u/${username}\`}` to `TipPage`
- `TipBits.jsx` — passes `pageUrl={window.location.href}` so the button also appears on the demo `/tip` route

**Feature behaviour:**
- "▣ Show QR" button sits below the BTC price badge in the creator header
- Modal shows: creator name, 220px `QRCodeSVG` (error correction level H), URL in mono font, Download PNG and Print QR buttons
- **Download:** hidden off-screen `QRCodeCanvas` at 512px; `toDataURL('image/png')` → dynamic `<a download="tipbits-{handle}.png">` click
- **Print:** opens a new window with a self-contained HTML print template (Bitcoin orange SVG logo, creator name, 280px QR as `<img>`, URL, TipBits tagline), then calls `window.print()`
- Commits pushed: `9838ed9` (QR feature), `92ffbae` (show on `/tip` too)

**Known debt introduced:** The QR modal and its button use inline `style={{ ... }}` props and the CSS is added to the existing embedded `<style>` block in `TipPage.jsx`. This violates the no-inline-styles rule. It must be refactored into `TipPage.css` as part of the broader inline-styles cleanup sprint (see Known remaining work below).

---

---

### Session — 2026-06-09 — Analytics, /learn Education Section, Analytics Removal

**Goal:** Add a private self-hosted analytics backend and admin dashboard. Add a five-article Bitcoin education section at `/learn`. Then remove all frontend tracking after discovering it caused VPN/DNS blocklist issues.

**Commits:** `a3fd79b`, `a8679e7`, `cd94f9d`

**Files changed:**
- `netlify/functions/analytics-event.js` — created (then deleted in `cd94f9d`): POST endpoint storing events to Netlify Blobs by day (`analytics:YYYY-MM-DD`). Tracked `page_view`, `invoice_generated`, `registration`, `edit`, `delete`. No PII, no IPs.
- `netlify/functions/analytics-data.js` — created and kept: GET endpoint, password-protected via `ADMIN_PASSWORD` env var (`/api/events/data`). Returns last N days of stored events for the admin dashboard.
- `analytics.js` — created (then deleted in `cd94f9d`): fire-and-forget client helper; `trackEvent()` called from `CreatorPage`, `TipPage`, `Register`.
- `Admin.jsx` — created and kept: private `/admin` route with password gate (checked server-side), stat cards per event type, daily bar chart (7/14/30 day toggle), top creator pages by view count, recent registrations list.
- `App.jsx` — added `/admin` route; added `/learn` and `/learn/:slug` routes.
- `Learn.jsx` — hub page: card grid with five topic cards, each linking to its article. Bitcoin orange theme, IBM Plex fonts matching site.
- `LearnArticle.jsx` — single component rendering all five articles by slug: *What is Bitcoin*, *Bitcoin as Money*, *Bitcoin vs CBDCs*, *What is the Lightning Network*, *Why This Matters for Creators*. Includes progress indicator, pull-quotes, comparison tables (Bitcoin vs CBDC), next-article nav, and bottom CTA to `/register`.
- `Landing.jsx` — added Learn to main nav (top and footer).
- `HowItWorks.jsx` — added "New to Bitcoin? Start here →" CTA linking to `/learn`.
- `.gitignore` — added `.npm-cache` after it was accidentally committed.
- `CreatorPage.jsx`, `TipPage.jsx`, `Register.jsx` — `trackEvent()` import and calls added then removed.

**Feature behaviour:**
- `/learn` renders a card grid of five topics in reading order.
- `/learn/:slug` renders the matching article with a pull-quote callout per section and a "Next →" nav link at the bottom.
- `/admin` is password-gated. The password is checked server-side against `ADMIN_PASSWORD` env var (set in Netlify dashboard). No data is exposed without the correct password.
- Zero data is collected or transmitted from the frontend. The event collection endpoint (`analytics-event.js`) was deleted entirely. Only `analytics-data.js` remains (read-only, server-side, password-protected).

**Why tracking was removed:**
ProtonVPN's NetShield (DNS-level ad/tracker blocker) flagged `tipbits.xyz` when the analytics endpoints used `/api/analytics/...` in their paths — a pattern on common tracker blocklists. This caused `NXDOMAIN` responses for the entire domain for users with NetShield active. Endpoints were first renamed to `/api/events/...`, then all frontend tracking was removed entirely as the correct call for a community where privacy is a first principle. The Admin dashboard is retained for future non-tracking uses (e.g. manual Blobs inspection, creator count).

**Known debt introduced:**
- `.npm-cache` was accidentally committed in an intermediate commit (too large for GitHub, caused push failures). Fixed by `git rm --cached` and adding to `.gitignore`. History was force-pushed clean with `git push --force-with-lease`. ✅ Resolved same session.
- DNS: the domain uses Netlify's own nameservers. Some VPN providers (ProtonVPN in certain exit countries) do not reliably resolve Netlify nameservers. **Recommended fix: migrate DNS to Cloudflare** (free). This was not done this session — see Known remaining work.

---

## Maintenance note

**This file must be updated at the end of every session.** Add a new entry under Session log covering: goal, commits, files changed, feature behaviour, and any debt introduced or resolved. Update Known remaining work if anything was completed or newly identified. Then push.

---

## Known remaining work

- **DNS — Cloudflare migration** — `tipbits.xyz` currently uses Netlify DNS as its nameserver. Some VPN providers (confirmed: ProtonVPN with NetShield on Italy/Romania exit nodes) return `NXDOMAIN` for the domain. Moving DNS management to Cloudflare (free) would permanently fix this. Steps: sign up at cloudflare.com → add `tipbits.xyz` → copy records → update nameservers at GoDaddy → switch Netlify to External DNS mode.
- **Rate limiting** — no rate limiting exists on any API endpoint. Netlify's rate-limiting addon or a KV-based IP counter should be added to protect against registration spam and brute-force attempts on the Sovereign Key verification endpoints.
