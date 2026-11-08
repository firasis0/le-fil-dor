import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../logo";
import styles from "./styles.module.scss";

const CLICKS_NEEDED = 3;
const MAX_GAP_MS = 700; // clicks further apart than this start over

// Page header with the logo. Pressing the logo 3 times quickly opens the hidden admin login
export default function Header() {
  const navigate = useNavigate();
  const clicks = useRef({ count: 0, last: 0 });

  // Hidden entrance: press the logo three times in a row to reach the admin login.
  function handleLogoClick() {
    const now = Date.now();
    const state = clicks.current;
    state.count = now - state.last <= MAX_GAP_MS ? state.count + 1 : 1;
    state.last = now;

    if (state.count >= CLICKS_NEEDED) {
      state.count = 0;
      navigate("/login");
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={handleLogoClick}>
        <Logo />
      </div>

      <h1 className={`${styles.wordmark} ltr`}>Le Fil d’Or</h1>

      <div className={styles.ornament} aria-hidden="true">
        <span />
        <i />
        <span />
      </div>

      <p className={styles.tagline}>تفصيل القفطان الجزائري حسب الطلب</p>
    </header>
  );
}
