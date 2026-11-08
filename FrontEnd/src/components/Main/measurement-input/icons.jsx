// Small hand-drawn line icons for the measurement cards (32×32, stroke = currentColor).

const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

// Sleeve icon
export const SleeveIcon = (props) => (
  <svg {...base} {...props}>
    <g transform="rotate(32 16 16)">
      <path d="M12.5 3.5h7l1 25h-9Z" />
      <path d="M12 23.5h8" />
    </g>
  </svg>
);

// Chest icon
export const ChestIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 9c0 6.6 3.2 11.4 7.3 11.4 1.9 0 2.7-1.5 2.7-3.7 0 2.2.8 3.7 2.7 3.7C22.8 20.4 26 15.6 26 9" />
    <path d="M9 9V4M23 9V4M6 9h5.5M20.5 9H26" />
    <path d="M10 14c1.2 2 2.4 2.6 3.6 2.6M22 14c-1.2 2-2.4 2.6-3.6 2.6" />
  </svg>
);

// Hips icon
export const HipsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 7h23l-1 6.5C25.4 18 21.6 21 17.8 22l-1.8 5-1.8-5C10.4 21 6.6 18 5.5 13.5Z" />
    <path d="M5 11h22" />
  </svg>
);

// Dress (garment length) icon
export const DressIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5 11 11 7 28h18l-4-17-1-7.5" />
    <path d="M12 3.5c.6 2.4 7.4 2.4 8 0M11 11h10" />
  </svg>
);

// Measuring tape icon
export const TapeIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="13.5" cy="15.5" r="9.5" />
    <circle cx="13.5" cy="15.5" r="3.4" />
    <path d="M23 15.5h6.5V23H19.6" />
    <path d="M23.4 18.4v2M26.4 18.4v2" />
  </svg>
);

export const MEASUREMENT_ICONS = {
  sleeves: SleeveIcon,
  chest: ChestIcon,
  hips: HipsIcon,
  length: DressIcon,
};
