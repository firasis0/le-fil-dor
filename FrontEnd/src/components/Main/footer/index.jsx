import Logo from "../logo";
import { GoldSprig } from "../decorations";
import styles from "./styles.module.scss";

// Page footer: short brand text, logo, copyright and the Powered by FeeQra credit
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <svg className={styles.wave} viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 44C220 8 470 6 720 30S1190 62 1440 20V70H0Z" fill="currentColor" />
        <path
          d="M0 44C220 8 470 6 720 30S1190 62 1440 20"
          fill="none"
          stroke="#c9a25a"
          strokeWidth="2.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <GoldSprig className={styles.sprigStart} seed={0.9} rotate={8} />
      <GoldSprig className={styles.sprigEnd} seed={2.2} flip rotate={-8} />

      <div className={styles.inner}>
        <p className={styles.about}>
          <span className="ltr">Le Fil d’Or</span> علامة جزائرية متخصصة في تفصيل القفطان التقليدي، بتصاميم راقية
          وتفاصيل متقنة تجمع بين الأصالة والأناقة.
        </p>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.brand}>
          <Logo tone="cream" className={styles.mark} />
          <span className={`${styles.name} ltr`}>Le Fil d’Or</span>
        </div>
      </div>

      <p className={styles.rights}>
        © 2026 جميع الحقوق محفوظة
        <span className={styles.powered}>
          Powered by <b>FeeQra</b>
        </span>
      </p>
    </footer>
  );
}
