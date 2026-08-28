import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Spinner, EmptyState, Banner } from '../components/Feedback';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/wishlist');
        setItems(data.wishlist);
      } catch {
        setError('Could not load your wishlist.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading wishlist" />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">My Wishlist</h1>
      {error && <Banner type="error">{error}</Banner>}
      {!error && items.length === 0 && (
        <EmptyState
          icon="💙"
          title="Your wishlist is empty"
          subtitle="Save items you love here so you can find them later."
          action={<Link to="/search" className="btn-primary mt-4">Browse products</Link>}
        />
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
}
