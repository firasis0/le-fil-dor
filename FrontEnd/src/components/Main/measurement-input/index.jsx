import { ChevronDown, ChevronUp } from "lucide-react";
import { MEASUREMENT_ICONS } from "./icons";
import { cn } from "../../../lib/utils";
import styles from "./styles.module.scss";

// One measurement card: label + icon on top, a number field with +/- underneath.
// Sits next to the illustration on tablets and desktops.
export default function MeasurementInput({ def, value, onChange, onActive, active, invalid }) {
  const Icon = MEASUREMENT_ICONS[def.key];

  // + / - buttons: add or remove `delta` cm, staying inside the allowed range
  const step = (delta) => {
    const current = value === "" ? def.start - delta : Number(value);
    const next = Math.min(def.max, Math.max(def.min, current + delta));
    onChange(def.key, String(next));
  };

  return (
    <div className={cn(styles.card, active && styles.active, invalid && styles.invalid)}>
      <label className={styles.label} htmlFor={`m-${def.key}`}>
        <span>{def.label}</span>
        <Icon className={styles.icon} />
      </label>

      <div className={styles.field}>
        <span className={styles.unit}>سم</span>
        <input
          id={`m-${def.key}`}
          type="number"
          inputMode="decimal"
          min={def.min}
          max={def.max}
          step="0.5"
          placeholder={def.start}
          value={value}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(def.key, e.target.value.slice(0, 5))}
          onFocus={() => onActive(def.key)}
          onBlur={() => onActive(null)}
        />
        <div className={styles.stepper}>
          <button type="button" tabIndex={-1} aria-label={`زيادة ${def.label}`} onClick={() => step(1)}>
            <ChevronUp size={12} strokeWidth={2.4} />
          </button>
          <button type="button" tabIndex={-1} aria-label={`إنقاص ${def.label}`} onClick={() => step(-1)}>
            <ChevronDown size={12} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
