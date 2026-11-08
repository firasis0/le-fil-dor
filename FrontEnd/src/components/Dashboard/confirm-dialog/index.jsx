import { useEffect } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import styles from "./styles.module.scss";

// Warning popup asking "are you sure?" before something dangerous (used to delete an order).
//   title / message : the texts
//   confirmLabel    : text of the red button
//   busy            : true while the request is running (buttons are disabled)
//   onConfirm / onCancel : what to do on each button
export default function ConfirmDialog({ title, message, confirmLabel, busy = false, onConfirm, onCancel }) {
  // Esc closes the popup (unless a request is running)
  useEffect(() => {
    // Esc key = cancel
    const onKey = (e) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className={styles.overlay} onClick={() => !busy && onCancel()}>
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.icon}>
          <TriangleAlert size={30} strokeWidth={1.6} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel} disabled={busy} autoFocus>
            إلغاء
          </button>
          <button type="button" className={styles.danger} onClick={onConfirm} disabled={busy}>
            {busy && <LoaderCircle size={18} className={styles.spin} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
