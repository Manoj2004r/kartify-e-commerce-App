import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CATEGORY_LINKS = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Books',
  'Sports & Fitness',
  'Beauty & Personal Care',
  'Toys & Kids',
  'Bags & Luggage',
];

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
    setMenuOpen(false);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 bg-ink text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 font-display text-xl font-bold tracking-tight">
          <span className="text-sunburst">Kart</span>ify
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands and more"
            className="w-full rounded-l-lg border-none px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="flex items-center rounded-r-lg bg-sunburst px-4 text-white transition hover:bg-sunburst-dark"
            aria-label="Search"
          >
            🔍
          </button>
        </form>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium md:flex">
          {user ? (
            <div className="group relative">
              <button className="flex items-center gap-1.5 hover:text-brand-300">
                <span>Hi, {user.name.split(' ')[0]}</span>
                <span aria-hidden="true">▾</span>
              </button>
              <div className="invisible absolute right-0 top-full w-44 rounded-lg bg-white py-1.5 text-ink opacity-0 shadow-cardHover transition group-hover:visible group-hover:opacity-100">
                <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-cream">My orders</Link>
                <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-cream">Wishlist</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-cream">Admin panel</Link>
                )}
                <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm hover:bg-cream">
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hover:text-brand-300">Sign in</Link>
          )}
          <Link to="/orders" className="hover:text-brand-300">Orders</Link>
          <Link to="/cart" className="relative flex items-center gap-1.5 hover:text-brand-300">
            <span aria-hidden="true">🛒</span>
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sunburst text-[10px] font-bold text-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </nav>

        <button
          className="ml-auto text-2xl md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Category rail */}
      <div className="hidden border-t border-white/10 bg-ink-light md:block">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-6 py-2 text-xs font-medium text-white/80">
          {CATEGORY_LINKS.map((cat) => (
            <Link
              key={cat}
              to={`/search?category=${encodeURIComponent(cat)}`}
              className="whitespace-nowrap transition hover:text-sunburst"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kartify"
              className="w-full rounded-l-lg px-3 py-2 text-sm text-ink focus:outline-none"
            />
            <button type="submit" className="rounded-r-lg bg-sunburst px-3 text-white">🔍</button>
          </form>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/cart">Cart ({itemCount})</Link>
            <Link to="/orders">My orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            {user?.role === 'admin' && <Link to="/admin">Admin panel</Link>}
            {user ? (
              <button onClick={logout} className="text-left">Sign out</button>
            ) : (
              <Link to="/login">Sign in</Link>
            )}
            <hr className="border-white/10" />
            {CATEGORY_LINKS.map((cat) => (
              <Link key={cat} to={`/search?category=${encodeURIComponent(cat)}`}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
