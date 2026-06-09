# TipBits — Claude Code Guide

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

## Known remaining work

- **`unsafe-inline` in current codebase** — `TipPage.jsx` and other components still contain `<style>{...}</style>` JSX blocks and inline `style={{ ... }}` props. These must be moved to `.css` files before the `unsafe-inline` token can be fully removed from the deployed CSP. A full prompt for this refactor has been drafted and is ready to run as a separate session.
- **Rate limiting** — no rate limiting exists on any API endpoint. Netlify's rate-limiting addon or a KV-based IP counter should be added to protect against registration spam and brute-force attempts.
