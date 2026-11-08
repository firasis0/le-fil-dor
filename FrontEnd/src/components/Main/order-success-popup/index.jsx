import { useEffect, useRef } from "react";
import styles from "./styles.module.scss";

// How long the thank-you popup stays on screen (milliseconds)
const SHOW_FOR = 4800;

// Small gold sparkles that burst out around the check mark: angle (deg), distance (px), delay (s)
const SPARKS = [
  [0, 74, 0.0], [45, 66, 0.08], [90, 78, 0.04], [135, 64, 0.12],
  [180, 74, 0.02], [225, 68, 0.1], [270, 80, 0.06], [315, 64, 0.14],
];

// Thank-you popup shown after an order is sent.
// It closes by itself after SHOW_FOR ms, or earlier with the button, a click outside, or the Esc key.
export default function OrderSuccessPopup({ orderNumber, onClose }) {
  // keep the latest onClose in a ref so the timer is started only once
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    // Close the popup (always calls the latest onClose)
    const close = () => closeRef.current();
    const timer = setTimeout(close, SHOW_FOR);
    // Esc key = close
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.popup}
        role="status"
        aria-live="polite"
        onClick={(e) => e.stopPropagation()}
        style={{ "--show-for": `${SHOW_FOR}ms` }}
      >
        <div className={styles.badge}>
          {SPARKS.map(([angle, distance, delay], i) => (
            <i
              key={i}
              className={styles.spark}
              style={{ "--angle": `${angle}deg`, "--distance": `${distance}px`, animationDelay: `${0.45 + delay}s` }}
            />
          ))}
          <svg viewBox="0 0 52 52" className={styles.check} aria-hidden="true">
            <circle className={styles.ring} cx="26" cy="26" r="23" />
            <path className={styles.tick} d="M15 27.5l8 8L37.5 18" />
          </svg>
        </div>

        <h2>شكراً لطلبك!</h2>
        <p>تم استلام طلبك بنجاح، سنتواصل معك قريباً لتأكيد الطلب.</p>
        {orderNumber && (
          <span className={styles.number}>
            رقم الطلب <b className="ltr">{orderNumber}</b>
          </span>
        )}

        <button type="button" className={styles.close} onClick={onClose}>
          حسناً
        </button>
        <span className={styles.timer} aria-hidden="true" />
      </div>
    </div>
  );
}
