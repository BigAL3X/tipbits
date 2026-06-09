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
