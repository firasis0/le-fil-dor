import { LoaderCircle, Send } from "lucide-react";
import styles from "./styles.module.scss";

// The "confirm order" button (+ an error line when sending failed).
// The thank-you message is a popup now (see order-success-popup).
export default function OrderSubmit({ status, failMessage }) {
  const sending = status === "sending";

  return (
    <div className={styles.wrap}>
      {status === "failed" && failMessage && (
        <p className={styles.failed} role="alert">
          {failMessage}
        </p>
      )}
      <button type="submit" className={styles.button} disabled={sending}>
        <span>{sending ? "جارٍ الإرسال…" : "تأكيد الطلب"}</span>
        {sending ? <LoaderCircle className={styles.spin} size={24} /> : <Send size={24} strokeWidth={1.6} />}
      </button>
    </div>
  );
}
