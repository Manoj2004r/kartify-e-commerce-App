import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { formatINR } from '../utils/format';
import { Banner } from '../components/Feedback';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const shipping = subtotal >= 999 ? 0 : 49;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: address, paymentMethod });
      await clearCart();
      navigate(`/orders/${data.order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-ink/60">Your cart is empty — add something before checking out.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Address line 1</label>
                <input
                  required
                  className="input"
                  value={address.line1}
                  onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Address line 2 (optional)</label>
                <input
                  className="input"
                  value={address.line2}
                  onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">City</label>
                <input
                  required
                  className="input"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State</label>
                <input
                  required
                  className="input"
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Pincode</label>
                <input
                  required
                  className="input"
                  value={address.pincode}
                  onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  required
                  className="input"
                  value={address.phone}
                  onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-semibold">Payment Method</h2>
            <div className="space-y-2 text-sm">
              {[
                { value: 'COD', label: 'Cash on Delivery' },
                { value: 'CARD', label: 'Credit / Debit Card' },
                { value: 'UPI', label: 'UPI' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {error && <Banner type="error">{error}</Banner>}
        </div>

        {/* Order summary */}
        <aside className="card h-fit p-5">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <ul className="mb-4 max-h-56 space-y-2 overflow-y-auto text-sm">
            {items.map(({ product, qty }) => (
              <li key={product._id} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-ink/70">{product.title} × {qty}</span>
                <span className="price shrink-0">{formatINR(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-ink/10 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="price">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="price">{shipping === 0 ? 'FREE' : formatINR(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Tax</dt>
              <dd className="price">{formatINR(tax)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd className="price">{formatINR(total)}</dd>
            </div>
          </dl>
          <button type="submit" disabled={placing} className="btn-primary mt-5 w-full">
            {placing ? 'Placing order…' : 'Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
