# TipBits ⚡

Peer-to-peer Lightning tips for creators. No middleman. No custody. No KYC.

## What it does

TipBits gives creators a personal tip page at a shareable URL. Tippers visit the page, pick an amount in sats, GBP, USD, or EUR, and pay via Lightning. Funds go directly to the creator's own wallet — TipBits never touches the money.

## Quick start

```bash
# Clone the repo
git clone https://github.com/yourusername/tipbits.git
cd tipbits

# Install dependencies
npm install

# Copy env template and fill in your details
cp .env.example .env.local

# Run locally
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_LIGHTNING_ADDRESS` | Your Lightning address e.g. `name@getalby.com` |
| `VITE_CREATOR_NAME` | Your display name |
| `VITE_CREATOR_HANDLE` | Your handle e.g. `@yourname` |
| `VITE_CREATOR_BIO` | Short bio shown on the tip page |

## Deploy to Netlify

1. Push to GitHub
2. Connect to Netlify (New site from Git)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify dashboard
6. Deploy

The `netlify.toml` file handles SPA redirects and security headers automatically.

## Tech stack

- React 18
- Vite 5
- Lightning Network via LNURL-pay
- CoinGecko API for live BTC price
- Netlify for hosting

## Architecture

TipBits is non-custodial by design. The creator registers their own Lightning address. When a tipper requests an invoice, TipBits fetches it directly from the creator's Lightning provider. TipBits never holds funds, private keys, or payment data.

See `CLAUDE_CODE_HANDOFF.md` for full technical implementation notes.

## Licence

MIT
