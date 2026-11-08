import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import OrderPage from "./pages/order-page";
import LoginPage from "./pages/login-page";
import DashboardPage from "./pages/dashboard-page";
import SettingsPage from "./pages/settings-page";
import { isLoggedIn } from "./lib/auth";

// Pages for the admin only. Without a login token the visitor is sent to /login.
// (The BackEnd refuses the data anyway, this just avoids showing an empty page.)
function RequireAdmin({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// All the pages of the website.
// Only the owner knows /login exists: it is reached by pressing the logo three times.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrderPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <DashboardPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <RequireAdmin>
              <SettingsPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
