import { useId } from "react";
import styles from "./styles.module.scss";

/* ───────── gold leaf sprig ─────────
   A curved stem with leaves placed along it. Everything is computed from the
   stem curve so the sprig looks grown, not stamped. `seed` changes the rhythm. */

const STEM = { p0: [60, 258], p1: [34, 196], p2: [86, 108], p3: [56, 10] };

// Point on a cubic bezier curve at position t (0..1), used to place the leaves
const bez = (t, i) => {
  const u = 1 - t;
  return (
    u * u * u * STEM.p0[i] +
    3 * u * u * t * STEM.p1[i] +
    3 * u * t * t * STEM.p2[i] +
    t * t * t * STEM.p3[i]
  );
};
// Direction of the same curve at t, so each leaf follows the stem
const bezTangent = (t) => {
  const u = 1 - t;
  // Slope of the curve on one axis (i = 0 for x, 1 for y)
  const d = (i) =>
    3 * u * u * (STEM.p1[i] - STEM.p0[i]) +
    6 * u * t * (STEM.p2[i] - STEM.p1[i]) +
    3 * t * t * (STEM.p3[i] - STEM.p2[i]);
  return Math.atan2(d(1), d(0)) * (180 / Math.PI);
};

// Compute every leaf of a sprig (position, size, angle). `seed` makes each sprig different
function buildLeaves(seed) {
  const leaves = [];
  const count = 9;
  for (let i = 0; i < count; i++) {
    const t = 0.1 + (i / (count - 1)) * 0.84;
    const wobble = Math.sin((i + 1) * (2.3 + seed)) * 6; // small, deterministic irregularity
    const side = i % 2 === 0 ? 1 : -1;
    const size = 1.15 - t * 0.55 + (wobble > 0 ? 0.04 : -0.04);
    leaves.push({
      x: bez(t, 0),
      y: bez(t, 1),
      rot: bezTangent(t) + side * (52 + wobble),
      size,
    });
  }
  // tip leaf continues the stem
  leaves.push({ x: STEM.p3[0], y: STEM.p3[1], rot: bezTangent(1), size: 0.62 });
  return leaves;
}

// Draws one gold sprig (stem + leaves) as SVG
function SprigArt({ seed }) {
  const id = useId();
  const leaves = buildLeaves(seed);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0dba4" />
          <stop offset="0.5" stopColor="#c9a25a" />
          <stop offset="1" stopColor="#e3c98a" />
        </linearGradient>
      </defs>
      <path
        d={`M${STEM.p0} C${STEM.p1} ${STEM.p2} ${STEM.p3}`}
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.size})`}>
          <path
            d="M0 0C5-8 19-11 31 0C19 11 5 8 0 0Z"
            fill={`url(#${id}-g)`}
            stroke="#b8924a"
            strokeWidth="0.6"
          />
          <path d="M3 0H26" stroke="#fff4d6" strokeWidth="0.8" opacity="0.7" />
        </g>
      ))}
    </>
  );
}

// Gold sprig ornament used in the corners and the footer. `flip` mirrors it, `rotate` tilts it
export function GoldSprig({ className = "", seed = 0, flip = false, rotate = 0 }) {
  return (
    <svg
      className={`${styles.sprig} ${className}`}
      viewBox="0 0 120 268"
      aria-hidden="true"
      style={{ transform: `${flip ? "scaleX(-1) " : ""}rotate(${rotate}deg)` }}
    >
      <SprigArt seed={seed} />
    </svg>
  );
}

/* ───────── burgundy curtain (top-left) ───────── */

// Decorative dark-wine curtain in the page background (SVG)
function Curtain() {
  const id = useId();
  return (
    <svg className={styles.curtain} viewBox="0 0 230 470" preserveAspectRatio="xMinYMin meet" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a0d1f" />
          <stop offset="0.45" stopColor="#6d1832" />
          <stop offset="1" stopColor="#541126" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d="M0 0H224C214 64 176 112 156 176C132 254 156 346 64 426C44 444 22 456 0 466Z" />
        </clipPath>
      </defs>

      <path
        d="M0 0H224C214 64 176 112 156 176C132 254 156 346 64 426C44 444 22 456 0 466Z"
        fill={`url(#${id}-base)`}
      />
      {/* folds: broad soft light and shadow bands that follow the drape */}
      <g clipPath={`url(#${id}-clip)`} filter={`url(#${id}-soft)`} fill="none" strokeLinecap="round">
        <path d="M44 -10C34 100 84 200 56 300C44 350 30 400 6 450" stroke="#a03a58" strokeWidth="20" opacity="0.32" />
        <path d="M96 -10C84 110 130 190 104 290C92 340 70 380 40 430" stroke="#2d0612" strokeWidth="22" opacity="0.4" />
        <path d="M150 -10C142 90 168 150 140 230C128 270 120 330 80 400" stroke="#b34a68" strokeWidth="16" opacity="0.28" />
        <path d="M196 -10C190 70 160 120 148 180" stroke="#2d0612" strokeWidth="16" opacity="0.35" />
      </g>
      {/* thin highlight that catches the leading edge */}
      <path
        d="M224 0C214 64 176 112 156 176C132 254 156 346 64 426C44 444 22 456 0 466"
        fill="none"
        stroke="#c9707f"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      {/* embroidered sprigs on the curtain */}
      <g transform="translate(20 28) scale(0.62) rotate(-10 60 134)">
        <SprigArt seed={1.1} />
      </g>
      <g transform="translate(118 176) scale(0.5) rotate(24 60 134)">
        <SprigArt seed={2.4} />
      </g>
    </svg>
  );
}

/* ───────── carved arch (top-right) ───────── */

// Decorative arch with a light band in the page background (SVG)
function Arch() {
  const id = useId();
  return (
    <svg className={styles.arch} viewBox="0 0 440 420" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf1ec" />
          <stop offset="1" stopColor="#ecd9d1" />
        </linearGradient>
        <pattern id={`${id}-lattice`} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M13 0V26M0 13H26" stroke="#e6d2ca" strokeWidth="1" />
          <circle cx="13" cy="13" r="2.4" fill="none" stroke="#e1cbc2" strokeWidth="1" />
        </pattern>
        <clipPath id={`${id}-inner`}>
          <path d="M70 420V210C70 112 150 40 250 40C350 40 440 112 440 210V420Z" />
        </clipPath>
      </defs>

      {/* outer band */}
      <path
        d="M40 420V210C40 92 140 6 260 6C380 6 470 92 470 210V420H402V210C402 138 340 74 260 74C180 74 108 138 108 210V420Z"
        fill={`url(#${id}-band)`}
      />
      <path
        d="M40 420V210C40 92 140 6 260 6C380 6 470 92 470 210V420"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.8"
        strokeWidth="1.4"
      />
      {/* dotted ornament following the band */}
      <path
        d="M74 420V210C74 112 150 40 260 40C370 40 436 112 436 210V420"
        fill="none"
        stroke="#d9b9ad"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray="0 13"
      />
      <path
        d="M108 420V210C108 138 180 74 260 74C340 74 402 138 402 210V420"
        fill="none"
        stroke="#e4cdc4"
        strokeWidth="1.2"
      />

      {/* carved lattice inside */}
      <g clipPath={`url(#${id}-inner)`}>
        <path d="M108 420V210C108 138 180 74 260 74C340 74 402 138 402 210V420Z" fill={`url(#${id}-lattice)`} opacity="0.85" />
      </g>
      {/* scalloped keyhole cap */}
      <path
        d="M170 210C170 168 208 132 260 132C312 132 340 168 340 210"
        fill="none"
        stroke="#dcc2b8"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/* ───────── page scenery ───────── */

// All the background decorations of the order page (curtain, arch, gold sprigs)
export default function Decorations() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <Curtain />
      <Arch />
      <GoldSprig className={styles.leftMid} seed={0.4} />
      <GoldSprig className={styles.rightMid} seed={1.7} flip />
      <GoldSprig className={styles.rightLow} seed={3.1} flip rotate={-8} />
    </div>
  );
}
