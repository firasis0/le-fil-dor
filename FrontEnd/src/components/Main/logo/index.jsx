import { useId } from "react";
import styles from "./styles.module.scss";

// Hand-drawn LR monogram (vector). `tone` picks ink on light backgrounds or cream on the wine footer.
// `withText=false` removes the small "LE FIL D'OR" line (used for tiny sizes).
export default function Logo({ tone = "ink", withText = true, className = "", ...rest }) {
  const maskId = useId();

  return (
    <svg
      className={`${styles.logo} ${styles[tone]} ${className}`}
      viewBox="180 168 490 432"
      role="img"
      aria-label="Le Fil d'Or"
      {...rest}
    >
      {withText && (
        <mask id={maskId} maskUnits="userSpaceOnUse" x="180" y="168" width="490" height="432">
          <rect x="180" y="168" width="490" height="432" fill="#fff" />
          {/* the L's stem is cut where the small wordmark crosses it */}
          <rect x="214" y="343" width="54" height="34" fill="#000" />
          {/* …and the R's bowl, so the "O" stays readable */}
          <rect x="462" y="343" width="52" height="34" fill="#000" />
        </mask>
      )}

      <g fill="currentColor">
        {/* L */}
        <path
          mask={withText ? `url(#${maskId})` : undefined}
          d="M197 180H273V190H250V397H400V405H197V397H222V190H197Z"
        />
        {/* R: stem, bowl (with its counter) and the long swash leg are separate shapes */}
        <path d="M340 271H392V515H415V528H338V515H365V283H340Z" />
        <path
          fillRule="evenodd"
          mask={withText ? `url(#${maskId})` : undefined}
          d="M392 271H452C486 271 506 296 506 328C506 368 480 400 436 404H392ZM392 283H445C468 283 480 302 480 328C480 360 462 386 430 392H392Z"
        />
        <path d="M425 398C462 408 520 452 566 506C596 541 626 580 660 586C626 596 590 580 560 552C522 516 470 462 408 418Z" />
      </g>

      {withText && (
        <g className={styles.small} fill="currentColor">
          <text x="186" y="372" textLength="44" lengthAdjust="spacing">LE</text>
          <text x="290" y="372" textLength="56" lengthAdjust="spacing">FIL</text>
          <text x="418" y="372" textLength="112" lengthAdjust="spacing">D’OR</text>
        </g>
      )}
    </svg>
  );
}
