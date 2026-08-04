import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';
import { EmptyState } from '../components/Feedback';

export default function Cart() {
  const { items, subtotal, removeFromCart, addToCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 49;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const handleCheckout = () => {
    navigate(user ? '/checkout' : '/login', { state: { from: { pathname: '/checkout' } } });
  };

  if (!loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          subtitle="Looks like you haven't added anything yet. Start exploring our deals."
          action={<Link to="/search" className="btn-primary mt-4">Start shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map(({ product, qty, lineTotal }) => (
            <li key={product._id} className="card flex gap-4 p-4">
              <Link to={`/product/${product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-cream">
                <img src={product.images?.[0]} alt={product.title} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link to={`/product/${product.slug}`} className="line-clamp-2 font-medium hover:text-brand-500">
                    {product.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink/50">{product.brand}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <label htmlFor={`qty-${product._id}`} className="text-ink/50">Qty</label>
                    <select
                      id={`qty-${product._id}`}
                      value={qty}
                      onChange={(e) => addToCart(product, Number(e.target.value))}
                      className="input w-16 px-2 py-1"
                    >
                      {Array.from({ length: Math.min(10, product.stock || 1) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="text-sm font-medium text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="price shrink-0 self-center text-right font-semibold">
                {formatINR(lineTotal ?? product.price * qty)}
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="card h-fit p-5">
          <h2 className="mb-4 font-semibold">Price Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="price">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="price">{shipping === 0 ? 'FREE' : formatINR(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Tax (5%)</dt>
              <dd className="price">{formatINR(tax)}</dd>
            </div>
            <hr className="my-2 border-ink/10" />
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd className="price">{formatINR(total)}</dd>
            </div>
          </dl>
          {shipping > 0 && (
            <p className="mt-3 text-xs text-success">
              Add {formatINR(999 - subtotal)} more for FREE shipping
            </p>
          )}
          <button onClick={handleCheckout} className="btn-primary mt-5 w-full">
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
