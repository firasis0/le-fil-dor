import { MEASUREMENT_ICONS } from "../measurement-input/icons";
import { cn } from "../../../lib/utils";
import styles from "./styles.module.scss";

// Phone version of a measurement: a compact tag on the illustration.
// Tapping it opens the bottom sheet, where the number is typed with a big keypad-friendly field.
export default function MeasurementMarker({ def, value, onOpen, invalid, active }) {
  const Icon = MEASUREMENT_ICONS[def.key];
  const filled = value !== "";

  return (
    <button
      type="button"
      className={cn(styles.marker, filled && styles.filled, active && styles.active, invalid && styles.invalid)}
      onClick={() => onOpen(def.key)}
      aria-label={`${def.label}: ${filled ? `${value} سم` : "اضغطي للإدخال"}`}
    >
      <span className={styles.top}>
        <span>{def.short}</span>
        <Icon className={styles.icon} />
      </span>
      <span className={styles.value}>
        {filled ? (
          <>
            <b>{value}</b> <small>سم</small>
          </>
        ) : (
          <em>أدخلي</em>
        )}
      </span>
    </button>
  );
}
