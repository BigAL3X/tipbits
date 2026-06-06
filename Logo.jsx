export default function Logo({ size = 32 }) {
  const scale = size / 32;
  const w = Math.round(140 * scale);
  const h = Math.round(36 * scale);

  return (
    <svg width={w} height={h} viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bitcoin circle */}
      <circle cx="18" cy="18" r="18" fill="#F7931A"/>
      {/* ₿ with slight slant via skew transform */}
      <text
        x="18" y="24"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        transform="skewX(-6) translate(1, 0)"
      >₿</text>

      {/* Semi-transparent lightning bolt behind text */}
      <g opacity="0.12">
        <path
          d="M74 2 L58 20 L68 20 L52 34 L82 16 L70 16 L86 2 Z"
          fill="#F7931A"
        />
      </g>

      {/* TipBits wordmark */}
      <text
        x="44" y="25"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="18"
        fontWeight="900"
        fill="#111827"
        letterSpacing="-0.5"
      >TipBits</text>
    </svg>
  );
}
