import { ClipboardList, LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "../../Main/logo";
import { cn } from "../../../lib/utils";
import styles from "./styles.module.scss";

// Top bar of every dashboard page: logo, title, the two pages (orders / settings) and logout.
// `subtitle` is the small line under the title (the orders page shows the counters there).
export default function DashboardHeader({ title, subtitle, onLogout }) {
  // NavLink adds the "active" look by itself for the page we are on
  const linkClass = ({ isActive }) => cn(styles.link, isActive && styles.active);

  return (
    <header className={styles.header}>
      <Logo className={styles.logo} withText={false} />
      <div className={styles.titles}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <nav className={styles.nav} aria-label="صفحات الإدارة">
        <NavLink to="/dashboard" end className={linkClass}>
          <ClipboardList size={18} strokeWidth={1.7} />
          <span>الطلبات</span>
        </NavLink>
        <NavLink to="/dashboard/settings" className={linkClass}>
          <Settings size={18} strokeWidth={1.7} />
          <span>الإعدادات</span>
        </NavLink>
      </nav>

      <button type="button" className={styles.logout} onClick={onLogout}>
        <LogOut size={18} strokeWidth={1.7} />
        <span>خروج</span>
      </button>
    </header>
  );
}
