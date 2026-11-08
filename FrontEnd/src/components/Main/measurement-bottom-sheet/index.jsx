import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";
import { MEASUREMENT_ICONS } from "../measurement-input/icons";
import styles from "./styles.module.scss";

// Phone-only sheet that slides up to enter one measurement.
export default function MeasurementBottomSheet({ def, value, onChange, onClose }) {
  const inputRef = useRef(null);
  const Icon = MEASUREMENT_ICONS[def.key];

  useEffect(() => {
    inputRef.current?.focus();
    // Esc key = close the sheet
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  // Add or remove `delta` cm, staying inside the allowed range
  const step = (delta) => {
    const current = value === "" ? def.start - delta : Number(value);
    onChange(def.key, String(Math.min(def.max, Math.max(def.min, current + delta))));
  };

  // Portal to <body>: the cards use backdrop-filter, which would otherwise trap a fixed element inside the card.
  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={def.label}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.grabber} aria-hidden="true" />

        <div className={styles.head}>
          <Icon className={styles.icon} />
          <div>
            <h3>{def.label}</h3>
            <p>بين {def.min} و {def.max} سم</p>
          </div>
        </div>

        <div className={styles.entry}>
          <button type="button" onClick={() => step(-1)} aria-label="إنقاص">
            <Minus size={22} />
          </button>
          <label className={styles.number}>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              step="0.5"
              min={def.min}
              max={def.max}
              placeholder={def.start}
              value={value}
              onChange={(e) => onChange(def.key, e.target.value.slice(0, 5))}
              onKeyDown={(e) => e.key === "Enter" && onClose()}
            />
            <span>سم</span>
          </label>
          <button type="button" onClick={() => step(1)} aria-label="زيادة">
            <Plus size={22} />
          </button>
        </div>

        <button type="button" className={styles.confirm} onClick={onClose}>
          تأكيد القياس
        </button>
      </div>
    </div>,
    document.body,
  );
}
