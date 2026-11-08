import { cn, formatDate } from "../../../lib/utils";
import { fileUrl } from "../../../lib/api";
import styles from "./styles.module.scss";

// Left column of the dashboard: one button per order (photo, name, place, number, status).
export default function OrderList({ orders, selectedId, onSelect }) {
  return (
    <ul className={styles.list}>
      {orders.map((order) => (
        <li key={order.id}>
          <button
            type="button"
            className={cn(styles.item, order.id === selectedId && styles.selected)}
            onClick={() => onSelect(order.id)}
          >
            <img src={fileUrl(order.model_image)} alt="" className={styles.thumb} loading="lazy" />
            <span className={styles.text}>
              <span className={styles.name}>
                {order.full_name}
                {order.status === "pending" ? (
                  <i className={styles.new}>جديد</i>
                ) : (
                  <i className={cn(styles.badge, styles[order.status])}>{order.status_label}</i>
                )}
              </span>
              <span className={styles.place}>
                {order.wilaya_name} — {order.commune_name}
              </span>
              <span className={styles.meta}>
                <b className="ltr">{order.order_number}</b> · <bdi>{formatDate(order.created_at)}</bdi>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
