import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatINR } from '../utils/format';
import { Spinner, Banner } from '../components/Feedback';

const STATUS_OPTIONS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data.orders);
    } catch {
      setError('Could not load orders. Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner label="Loading admin panel" />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">Admin — Order Management</h1>
      {error && <Banner type="error">{error}</Banner>}

      {!error && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">{order.user?.name || '—'}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="price px-4 py-3">{formatINR(order.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="input w-40 py-1.5 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="p-6 text-center text-sm text-ink/50">No orders placed yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
