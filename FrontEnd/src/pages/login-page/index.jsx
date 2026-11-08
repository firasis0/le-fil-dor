import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import Logo from "../../components/Main/logo";
import { isLoggedIn, login } from "../../lib/auth";
import styles from "./styles.module.scss";

// Admin login page (reached by pressing the logo 3 times on the order page)
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  if (isLoggedIn()) return <Navigate to="/dashboard" replace />;

  // Ask the BackEnd to check the email + password; on success go to the dashboard
  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <Logo className={styles.logo} />
        <h1>دخول الإدارة</h1>
        <p className={styles.lead}>هذه الصفحة خاصة بإدارة Le Fil d’Or.</p>

        <label className={styles.field}>
          <span>البريد الإلكتروني</span>
          <div className={styles.control}>
            <Mail size={19} strokeWidth={1.5} />
            <input
              type="email"
              dir="ltr"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>
        </label>

        <label className={styles.field}>
          <span>كلمة المرور</span>
          <div className={styles.control}>
            <Lock size={19} strokeWidth={1.5} />
            <input
              type="password"
              dir="ltr"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </div>
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={sending}>
          {sending ? "جارٍ التحقق…" : "دخول"}
        </button>
        <Link to="/" className={styles.back}>
          العودة إلى الموقع
        </Link>
      </form>
    </main>
  );
}
