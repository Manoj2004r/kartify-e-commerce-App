import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Spinner, EmptyState, Banner } from '../components/Feedback';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Books',
  'Sports & Fitness',
  'Beauty & Personal Care',
  'Toys & Kids',
  'Bags & Luggage',
];

const SORTS = [
  { value: '', label: 'Relevance' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'newest', label: 'Newest First' },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const keyword = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';
  const page = Number(params.get('page') || 1);
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/products', {
          params: { keyword, category, sort, page, minPrice, maxPrice, limit: 12 },
        });
        setResult(data);
      } catch {
        setError('Something went wrong while fetching products.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [keyword, category, sort, page, minPrice, maxPrice]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          {keyword ? `Results for "${keyword}"` : category || 'All products'}
          {!loading && <span className="ml-2 text-sm font-normal text-ink/50">({result.total} items)</span>}
        </h1>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="input w-auto"
          aria-label="Sort products"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        {/* Filters sidebar */}
        <aside className="card h-fit p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Category</h3>
          <ul className="mb-6 space-y-1.5 text-sm">
            <li>
              <button
                onClick={() => updateParam('category', '')}
                className={`hover:text-brand-500 ${!category ? 'font-semibold text-brand-500' : ''}`}
              >
                All categories
              </button>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c}>
                <button
                  onClick={() => updateParam('category', c)}
                  className={`text-left hover:text-brand-500 ${category === c ? 'font-semibold text-brand-500' : ''}`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Price (₹)</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={minPrice}
              onBlur={(e) => updateParam('minPrice', e.target.value)}
              className="input px-2 py-1.5 text-sm"
            />
            <span className="text-ink/40">–</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam('maxPrice', e.target.value)}
              className="input px-2 py-1.5 text-sm"
            />
          </div>
        </aside>

        {/* Results */}
        <div>
          {loading && <Spinner label="Finding products" />}
          {error && <Banner type="error">{error}</Banner>}
          {!loading && !error && result.items.length === 0 && (
            <EmptyState
              title="No products found"
              subtitle="Try a different search term, category, or clear your filters."
            />
          )}
          {!loading && !error && result.items.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.items.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {result.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                    className="btn-outline px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-ink/60">
                    Page {result.page} of {result.pages}
                  </span>
                  <button
                    disabled={page >= result.pages}
                    onClick={() => updateParam('page', String(page + 1))}
                    className="btn-outline px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
