import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/Dashboard/dashboard-header";
import AccountSettings from "../../components/Dashboard/account-settings";
import { logout } from "../../lib/auth";
import styles from "./styles.module.scss";

// Dashboard > Settings: where the admin changes the login email and password.
export default function SettingsPage() {
  const navigate = useNavigate();

  // Forget the token and go back to the login page
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.page}>
      <DashboardHeader title="الإعدادات" subtitle="بيانات الدخول إلى لوحة التحكم" onLogout={handleLogout} />
      <main className={styles.content}>
        <AccountSettings />
      </main>
    </div>
  );
}
