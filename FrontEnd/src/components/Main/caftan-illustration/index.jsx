import modelImage from "../../../assets/images/caftan-model.webp";
import { cn } from "../../../lib/utils";
import styles from "./styles.module.scss";

// The model artwork (with its dashed measuring lines) sits in the middle of the stage.
// Everything interactive — leader lines and the pulsing rings — is drawn on top as vector.
export default function CaftanIllustration({ layout, activeKey, filled }) {
  const { stage, figure, card, items } = layout;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${stage.width} ${stage.height}`}
      role="img"
      aria-label="رسم قفطان يوضّح أماكن القياسات الأربعة"
    >
      <defs>
        <radialGradient id="floor-shadow">
          <stop offset="0" stopColor="#8a2744" stopOpacity="0.2" />
          <stop offset="1" stopColor="#8a2744" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft pool of shadow under the hem */}
      <ellipse
        cx={figure.x + figure.width / 2}
        cy={figure.y + figure.height - 4}
        rx={figure.width * 0.8}
        ry={figure.width * 0.09}
        fill="url(#floor-shadow)"
      />

      <image href={modelImage} {...figure} />

      {items.map(({ def, card: pos, anchor }) => {
        const from = { x: pos.side === "right" ? pos.x + card.width : pos.x, y: pos.y + card.height / 2 };
        const active = activeKey === def.key;
        return (
          <g key={def.key} className={cn(styles.marker, active && styles.active, filled[def.key] && styles.filled)}>
            <line className={styles.glow} x1={from.x} y1={from.y} x2={anchor.x} y2={anchor.y} />
            <line className={styles.leader} x1={from.x} y1={from.y} x2={anchor.x} y2={anchor.y} />
            <circle className={styles.ring} cx={anchor.x} cy={anchor.y} r="9" />
            <circle className={styles.dot} cx={anchor.x} cy={anchor.y} r="4.6" />
          </g>
        );
      })}
    </svg>
  );
}
