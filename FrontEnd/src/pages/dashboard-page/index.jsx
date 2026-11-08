import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import DashboardHeader from "../../components/Dashboard/dashboard-header";
import OrderList from "../../components/Dashboard/order-list";
import OrderDetails from "../../components/Dashboard/order-details";
import ConfirmDialog from "../../components/Dashboard/confirm-dialog";
import { logout } from "../../lib/auth";
import { deleteOrder, fetchOrders, updateOrderStatus } from "../../lib/orders";
import { cn } from "../../lib/utils";
import styles from "./styles.module.scss";

// Check for new orders every 30 seconds while the dashboard is open
const REFRESH_EVERY = 30000;

// The admin page that lists the orders received from customers.
export default function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [toDelete, setToDelete] = useState(null); // the order waiting for the "are you sure?" answer
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  // Download the orders from the BackEnd
  const loadOrders = useCallback(() => {
    return fetchOrders()
      .then((list) => {
        setOrders(list);
        setLoadError("");
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  // Load once when the page opens, then keep refreshing in the background
  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, REFRESH_EVERY);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const selected = orders.find((o) => o.id === selectedId);
  const newCount = orders.filter((o) => o.status === "pending").length;

  // The admin chose another status in the details panel
  async function handleStatusChange(order, status) {
    setActionError("");
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
    } catch (error) {
      setActionError(error.message);
    }
  }

  // The admin confirmed the warning popup: delete for real
  async function confirmDelete() {
    setDeleting(true);
    setActionError("");
    try {
      await deleteOrder(toDelete.id);
      setOrders((list) => list.filter((o) => o.id !== toDelete.id));
      setSelectedId(null);
      setToDelete(null);
    } catch (error) {
      setActionError(error.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  // Forget the token and go back to the login page
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const subtitle =
    orders.length === 0 ? "لا توجد طلبات بعد" : newCount > 0 ? `${orders.length} طلب — ${newCount} جديد` : `${orders.length} طلب`;

  return (
    <div className={styles.page}>
      <DashboardHeader title="الطلبات" subtitle={loading ? "" : subtitle} onLogout={handleLogout} />

      {(loadError || actionError) && (
        <div className={styles.error} role="alert">
          <span>{loadError || actionError}</span>
          <button type="button" onClick={loadOrders}>
            <RefreshCw size={15} /> إعادة المحاولة
          </button>
        </div>
      )}

      {loading ? (
        <p className={styles.loading}>جارٍ تحميل الطلبات…</p>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <h2>لا توجد طلبات بعد</h2>
          <p>ستظهر هنا كل طلبية جديدة مع صورة القفطان والقياسات ومعلومات الزبونة.</p>
        </div>
      ) : (
        <div className={cn(styles.layout, selected && styles.showDetails)}>
          <aside className={styles.list}>
            <OrderList orders={orders} selectedId={selectedId} onSelect={setSelectedId} />
          </aside>

          <section className={styles.detail}>
            {selected ? (
              <OrderDetails
                order={selected}
                onBack={() => setSelectedId(null)}
                onStatusChange={(status) => handleStatusChange(selected, status)}
                onDelete={() => setToDelete(selected)}
              />
            ) : (
              <p className={styles.hint}>اختاري طلباً من القائمة لعرض تفاصيله.</p>
            )}
          </section>
        </div>
      )}

      {/* warning popup before deleting */}
      {toDelete && (
        <ConfirmDialog
          title="حذف الطلب؟"
          message={`سيتم حذف الطلب ${toDelete.order_number} للزبونة ${toDelete.full_name} مع صورته نهائياً، ولا يمكن التراجع عن ذلك.`}
          confirmLabel="نعم، احذف الطلب"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
