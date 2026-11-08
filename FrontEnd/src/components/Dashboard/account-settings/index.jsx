import { useState } from "react";
import { KeyRound, Lock, Mail } from "lucide-react";
import { changeEmail, changePassword, getAdmin } from "../../../lib/auth";
import styles from "./styles.module.scss";

// One labelled input with its own error line.
function Field({ label, error, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

// Form 1: change the login email.
function EmailForm() {
  const [email, setEmail] = useState(getAdmin()?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  // Send the new email to the BackEnd; show its field errors or a success message
  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setSending(true);
    try {
      const data = await changeEmail(currentPassword, email);
      setSuccess(data.detail);
      setCurrentPassword("");
    } catch (error) {
      // field errors come from the BackEnd; otherwise show the general message
      setErrors(Object.keys(error.fields).length ? error.fields : { general: error.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2>
        <Mail size={20} strokeWidth={1.6} /> البريد الإلكتروني
      </h2>
      <p className={styles.hint}>هذا هو البريد الذي تدخلين به إلى لوحة التحكم.</p>

      <Field label="البريد الجديد" error={errors.new_email}>
        <input type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="كلمة المرور الحالية" error={errors.current_password}>
        <input
          type="password"
          dir="ltr"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </Field>

      {errors.general && <p className={styles.error} role="alert">{errors.general}</p>}
      {success && <p className={styles.success} role="status">{success}</p>}

      <button type="submit" className={styles.submit} disabled={sending}>
        {sending ? "جارٍ الحفظ…" : "حفظ البريد"}
      </button>
    </form>
  );
}

// Form 2: change the login password.
function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  // Send the passwords to the BackEnd; show its field errors or a success message
  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setSending(true);
    try {
      const data = await changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess(data.detail);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrors(Object.keys(error.fields).length ? error.fields : { general: error.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2>
        <KeyRound size={20} strokeWidth={1.6} /> كلمة المرور
      </h2>
      <p className={styles.hint}>8 أحرف على الأقل. ستبقين مسجّلة الدخول بعد التغيير.</p>

      <Field label="كلمة المرور الحالية" error={errors.current_password}>
        <input
          type="password"
          dir="ltr"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </Field>
      <Field label="كلمة المرور الجديدة" error={errors.new_password}>
        <input
          type="password"
          dir="ltr"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Field>
      <Field label="تأكيد كلمة المرور الجديدة" error={errors.confirm_password}>
        <input
          type="password"
          dir="ltr"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Field>

      {errors.general && <p className={styles.error} role="alert">{errors.general}</p>}
      {success && <p className={styles.success} role="status">{success}</p>}

      <button type="submit" className={styles.submit} disabled={sending}>
        <Lock size={16} /> {sending ? "جارٍ الحفظ…" : "حفظ كلمة المرور"}
      </button>
    </form>
  );
}

// The two forms side by side (stacked on phones).
export default function AccountSettings() {
  return (
    <div className={styles.grid}>
      <EmailForm />
      <PasswordForm />
    </div>
  );
}
