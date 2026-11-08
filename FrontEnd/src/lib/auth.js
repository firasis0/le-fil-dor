// Admin login, logout and account changes. All real work is done by the BackEnd.
import { api, clearToken, getToken, setToken } from "./api";

const ADMIN_KEY = "lefildor.admin";

// Is there a saved login token? (the BackEnd still checks it on every request)
export const isLoggedIn = () => Boolean(getToken());

// The logged in admin { id, username, email } saved at login, used to show the email in Settings
export function getAdmin() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY));
  } catch {
    return null;
  }
}

// Remember who is logged in (shown on the Settings page)
const saveAdmin = (admin) => localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));

// Sends email + password. On success the token is saved. Throws ApiError on failure.
export async function login(email, password) {
  const data = await api("/api/auth/login/", { method: "POST", body: { email, password }, auth: false });
  setToken(data.token);
  saveAdmin(data.admin);
  return data.admin;
}

// Forget the token (the browser side of "log out")
export function logout() {
  clearToken();
  localStorage.removeItem(ADMIN_KEY);
}

// Change the login email. Needs the current password.
export async function changeEmail(currentPassword, newEmail) {
  const data = await api("/api/auth/change-email/", {
    method: "POST",
    body: { current_password: currentPassword, new_email: newEmail },
  });
  saveAdmin(data.admin);
  return data;
}

// Change the login password. Needs the current password.
// The BackEnd cancels the old token and returns a new one, which we save so the admin stays logged in.
export async function changePassword(currentPassword, newPassword, confirmPassword) {
  const data = await api("/api/auth/change-password/", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword },
  });
  setToken(data.token);
  return data;
}
