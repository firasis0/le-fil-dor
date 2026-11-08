// The ONE place that talks to the BackEnd.
// Every other file calls `api(...)` and never uses fetch directly,
// so the address, the login token and the error messages are handled here only.

// Address of the BackEnd, taken from FrontEnd/.env (VITE_API_URL)
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

const TOKEN_KEY = "lefildor.token";

// ── login token (kept in the browser so a refresh does not log the admin out) ──
export const getToken = () => localStorage.getItem(TOKEN_KEY);
// Save the login token in the browser
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
// Forget the login token
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// "/uploads/abc.jpg" -> "http://localhost:8000/uploads/abc.jpg"
export function fileUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

// Error thrown for every failed request.
//   message : one Arabic sentence that can be shown to the user
//   status  : HTTP status (0 = the server could not be reached)
//   fields  : { fieldName: "message" } when the server complains about specific fields
export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

// Turns the BackEnd's error body into { message, fields }.
// The BackEnd answers { detail: "..." } or { field: ["message", ...] }.
function readError(data) {
  if (!data || typeof data !== "object") return { message: "حدث خطأ غير متوقع", fields: {} };

  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (key !== "detail") fields[key] = Array.isArray(value) ? value[0] : String(value);
  }
  const message = data.detail || Object.values(fields)[0] || "حدث خطأ غير متوقع";
  return { message, fields };
}

// api("/api/orders/")                               -> GET
// api("/api/orders/", { method: "POST", body })     -> body can be a plain object (JSON) or FormData (files)
// api("/api/auth/login/", { method: "POST", body, auth: false })  -> do not send the token
// Returns the parsed JSON (or null when the server answers with no content).
export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (body instanceof FormData) {
    options.body = body; // the browser sets the multipart header by itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError("تعذّر الاتصال بالخادم، تحقّقي من الاتصال وأعيدي المحاولة", 0);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    // An expired / invalid token on a protected page: log out and go to the login page
    if (response.status === 401 && auth) {
      clearToken();
      window.location.assign("/login");
    }
    const { message, fields } = readError(data);
    throw new ApiError(message, response.status, fields);
  }
  return data;
}
