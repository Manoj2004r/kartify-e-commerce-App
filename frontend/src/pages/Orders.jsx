import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/format';
import { Spinner, EmptyState, Banner } from '../components/Feedback';

const STATUS_STYLES = {
  PLACED: 'bg-brand-50 text-brand-700',
  CONFIRMED: 'bg-brand-50 text-brand-700',
  SHIPPED: 'bg-yellow-50 text-yellow-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.orders);
      } catch {
        setError('Could not load your orders.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading orders" />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">My Orders</h1>
      {error && <Banner type="error">{error}</Banner>}
      {!error && orders.length === 0 && (
        <EmptyState
          icon="📦"
          title="No orders yet"
          subtitle="Your placed orders will show up here."
          action={<Link to="/search" className="btn-primary mt-4">Start shopping</Link>}
        />
      )}
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order._id}>
            <Link to={`/orders/${order._id}`} className="card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm text-ink/50">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-ink/40">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="mt-1 text-sm">{order.items.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="price font-semibold">{formatINR(order.totalPrice)}</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                  {order.status}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
