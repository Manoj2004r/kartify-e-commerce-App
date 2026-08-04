import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/format';
import { Spinner, Banner } from '../components/Feedback';

const STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch {
        setError('Order not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Spinner label="Loading order" />;
  if (error || !order) return <div className="mx-auto max-w-2xl px-6 py-12"><Banner type="error">{error}</Banner></div>;

  const stepIndex = order.status === 'CANCELLED' ? -1 : STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {location.state?.justPlaced && (
        <Banner type="success">
          🎉 Order placed successfully! We'll email you updates as it ships.
        </Banner>
      )}

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-ink/50">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/orders" className="text-sm font-medium text-brand-500 hover:underline">← All orders</Link>
      </div>

      {/* Status tracker */}
      {order.status !== 'CANCELLED' ? (
        <div className="card mb-6 p-5">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i <= stepIndex ? 'bg-success text-white' : 'bg-ink/10 text-ink/40'
                  }`}
                >
                  {i <= stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${i <= stepIndex ? 'font-medium text-ink' : 'text-ink/40'}`}>
                  {step[0] + step.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Banner type="error">This order was cancelled.</Banner>
      )}

      <div className="card mb-6 p-5">
        <h2 className="mb-3 font-semibold">Items</h2>
        <ul className="divide-y divide-ink/5">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-3 py-3">
              <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-ink/50">Qty: {item.qty}</p>
              </div>
              <p className="price text-sm font-semibold">{formatINR(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-2 font-semibold">Shipping Address</h2>
          <p className="text-sm text-ink/70">
            {order.shippingAddress.line1}, {order.shippingAddress.line2 && `${order.shippingAddress.line2}, `}
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="mt-1 text-sm text-ink/50">Phone: {order.shippingAddress.phone}</p>
        </div>
        <div className="card p-5">
          <h2 className="mb-2 font-semibold">Payment</h2>
          <p className="text-sm text-ink/70">Method: {order.paymentMethod}</p>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink/50">Items</dt><dd className="price">{formatINR(order.itemsPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Shipping</dt><dd className="price">{order.shippingPrice === 0 ? 'FREE' : formatINR(order.shippingPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Tax</dt><dd className="price">{formatINR(order.taxPrice)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd className="price">{formatINR(order.totalPrice)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
