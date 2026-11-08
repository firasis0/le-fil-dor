// Order requests to the BackEnd (one small function per endpoint).
import { api } from "./api";

// PUBLIC: the customer sends the order form (FormData because it contains the photo)
export const createOrder = (formData) => api("/api/orders/", { method: "POST", body: formData, auth: false });

// ADMIN: all orders, newest first
export const fetchOrders = () => api("/api/orders/");

// ADMIN: change the status of one order ("pending", "contacted", "in_progress", "completed", "cancelled")
export const updateOrderStatus = (id, status) => api(`/api/orders/${id}/`, { method: "PATCH", body: { status } });

// ADMIN: delete one order (and its photo)
export const deleteOrder = (id) => api(`/api/orders/${id}/`, { method: "DELETE" });

// The statuses an order can have, in the order they are shown in the menu
export const STATUSES = [
  { value: "pending", label: "جديد" },
  { value: "contacted", label: "تم الاتصال" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغى" },
];
