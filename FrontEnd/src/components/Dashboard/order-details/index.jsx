import { ArrowRight, ExternalLink, MapPin, Phone, Trash2, User } from "lucide-react";
import { MEASUREMENT_ICONS } from "../../Main/measurement-input/icons";
import { MEASUREMENTS } from "../../../lib/measurements";
import { formatDate, formatPhone } from "../../../lib/utils";
import { fileUrl } from "../../../lib/api";
import { STATUSES } from "../../../lib/orders";
import styles from "./styles.module.scss";

// The measurement keys used by the form -> the field names sent by the BackEnd
const FIELD = { sleeves: "sleeve_length", chest: "chest", hips: "hips", length: "garment_length" };

// Right side of the dashboard: everything about the selected order, plus status menu and delete button.
//   onStatusChange(status) : the admin picked another status
//   onDelete()             : the admin pressed delete (the page shows the warning popup)
export default function OrderDetails({ order, onBack, onStatusChange, onDelete }) {
  return (
    <article className={styles.details}>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowRight size={18} /> كل الطلبات
      </button>

      <div className={styles.top}>
        <h2>
          طلب <span className="ltr">{order.order_number}</span>
        </h2>
        <p>{formatDate(order.created_at)}</p>
      </div>

      <div className={styles.actions}>
        <label className={styles.statusField}>
          <span>حالة الطلب</span>
          <select value={order.status} onChange={(e) => onStatusChange(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.delete} onClick={onDelete}>
          <Trash2 size={17} strokeWidth={1.7} /> حذف الطلب
        </button>
      </div>

      <div className={styles.grid}>
        <figure className={styles.photo}>
          <img src={fileUrl(order.model_image)} alt={`تصميم القفطان المطلوب من ${order.full_name}`} />
          <a className={styles.download} href={fileUrl(order.model_image)} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> فتح الصورة
          </a>
        </figure>

        <div className={styles.info}>
          <section>
            <h3>الزبونة</h3>
            <dl className={styles.customer}>
              <div>
                <dt>
                  <User size={16} /> الاسم
                </dt>
                <dd>{order.full_name}</dd>
              </div>
              <div>
                <dt>
                  <Phone size={16} /> الهاتف
                </dt>
                <dd>
                  <a href={`tel:${order.phone}`} className="ltr">
                    {formatPhone(order.phone)}
                  </a>
                </dd>
              </div>
              <div>
                <dt>
                  <MapPin size={16} /> العنوان
                </dt>
                <dd>
                  {order.wilaya_name} — {order.commune_name}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3>القياسات</h3>
            <ul className={styles.measures}>
              {MEASUREMENTS.map((m) => {
                const Icon = MEASUREMENT_ICONS[m.key];
                return (
                  <li key={m.key}>
                    <Icon />
                    <span>{m.label}</span>
                    <b>
                      {order[FIELD[m.key]]} <small>سم</small>
                    </b>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
