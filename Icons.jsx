// Shared minimalist line-art icon set.
// Stroke icons inherit color via currentColor; duotone accents use the
// --ico-accent custom property (defaults to brand orange) so color stays in CSS.

function Base({ size = 20, className = "", children, viewBox = "0 0 24 24" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ico ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconBolt({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M13 2 4.6 13H11l-1 9 9.4-12H13l1.4-8z" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconKey({ size, className }) {
  return (
    <Base size={size} className={className}>
      <circle cx="7.5" cy="15.5" r="4.5" fill="var(--ico-accent-soft, transparent)" />
      <path d="m21 2-9.6 9.6M15.5 7.5 19 11M12.5 10.5 15 13" />
    </Base>
  );
}

export function IconLink({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </Base>
  );
}

export function IconLock({ size, className }) {
  return (
    <Base size={size} className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2.5" fill="var(--ico-accent-soft, transparent)" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Base>
  );
}

export function IconEyeOff({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </Base>
  );
}

export function IconMail({ size, className }) {
  return (
    <Base size={size} className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2.5" fill="var(--ico-accent-soft, transparent)" />
      <path d="m22 7-10 6L2 7" />
    </Base>
  );
}

export function IconArrowsLR({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M17 4l4 4-4 4M21 8H8M7 12l-4 4 4 4M3 16h13" />
    </Base>
  );
}

export function IconGlobe({ size, className }) {
  return (
    <Base size={size} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Base>
  );
}

export function IconTarget({ size, className }) {
  return (
    <Base size={size} className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconCheck({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="m4 12.5 5.5 5.5L20 6.5" />
    </Base>
  );
}

export function IconX({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Base>
  );
}

export function IconClock({ size, className }) {
  return (
    <Base size={size} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Base>
  );
}

export function IconQR({ size, className }) {
  return (
    <Base size={size} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM21 14v2M14 21h2M19 19h2v2h-2z" />
    </Base>
  );
}

export function IconScale({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M12 3v18M5 21h14M12 3 5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7M12 3l7 4 3 7a3.5 3.5 0 0 1-6 0l3-7" />
    </Base>
  );
}

export function IconBank({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="m3 9 9-6 9 6H3zM5 9v8M9.5 9v8M14.5 9v8M19 9v8M3 21h18" />
    </Base>
  );
}

export function IconMic({ size, className }) {
  return (
    <Base size={size} className={className}>
      <rect x="9" y="2" width="6" height="11" rx="3" fill="var(--ico-accent-soft, transparent)" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" />
    </Base>
  );
}

export function IconDownload({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Base>
  );
}

export function IconPrinter({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
    </Base>
  );
}

export function IconBitcoin({ size, className }) {
  return (
    <Base size={size} className={className}>
      <path d="M9 4v16M13 4v2M13 18v2M7 6h7a3 3 0 0 1 0 6H7M7 12h8a3 3 0 0 1 0 6H7" />
    </Base>
  );
}
