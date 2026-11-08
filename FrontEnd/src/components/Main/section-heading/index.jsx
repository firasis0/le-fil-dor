import styles from "./styles.module.scss";

// Shared heading for the three order steps: number badge + icon + title, subtitle underneath.
export default function SectionHeading({ number, title, subtitle, icon, id }) {
  return (
    <div className={styles.heading}>
      <div className={styles.row}>
        <span className={styles.badge} aria-hidden="true">
          {number}
        </span>
        <h2 className={styles.title} id={id}>
          <span className={styles.icon}>{icon}</span>
          {title}
        </h2>
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
