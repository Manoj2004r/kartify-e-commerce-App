import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Spinner, Banner } from '../components/Feedback';

const HERO_SLIDES = [
  {
    title: 'Big Electronics Sale',
    subtitle: 'Up to 40% off headphones, laptops & smartwatches',
    cta: 'Shop Electronics',
    category: 'Electronics',
    bg: 'from-brand-700 to-brand-500',
  },
  {
    title: 'Refresh Your Wardrobe',
    subtitle: 'New season fashion starting at ₹499',
    cta: 'Shop Fashion',
    category: 'Fashion',
    bg: 'from-ink to-brand-700',
  },
  {
    title: 'Home & Kitchen Essentials',
    subtitle: 'Everything for a cozier home, delivered fast',
    cta: 'Shop Home & Kitchen',
    category: 'Home & Kitchen',
    bg: 'from-sunburst-dark to-sunburst',
  },
];

const CATEGORY_TILES = [
  { name: 'Electronics', emoji: '🎧' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Home & Kitchen', emoji: '🍳' },
  { name: 'Books', emoji: '📚' },
  { name: 'Sports & Fitness', emoji: '🏋️' },
  { name: 'Beauty & Personal Care', emoji: '💄' },
  { name: 'Toys & Kids', emoji: '🧸' },
  { name: 'Bags & Luggage', emoji: '🎒' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setFeatured(data.items);
      } catch {
        setError('Could not load featured deals. Is the API running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = HERO_SLIDES[slide];

  return (
    <div className="pb-16">
      {/* Hero */}
      <section
        className={`bg-gradient-to-r ${active.bg} px-6 py-14 text-white transition-colors duration-700 md:py-20`}
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/70">Today's pick</p>
          <h1 className="max-w-xl font-display text-3xl font-bold leading-tight md:text-5xl">
            {active.title}
          </h1>
          <p className="mt-3 max-w-md text-white/85 md:text-lg">{active.subtitle}</p>
          <Link
            to={`/search?category=${encodeURIComponent(active.category)}`}
            className="btn-primary mt-6 inline-flex"
          >
            {active.cta} →
          </Link>
          <div className="mt-8 flex gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setSlide(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-8 bg-white' : 'w-3 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-4 text-xl font-semibold">Shop by category</h2>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.name}
              to={`/search?category=${encodeURIComponent(c.name)}`}
              className="card flex flex-col items-center gap-2 p-3 text-center"
            >
              <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
              <span className="text-xs font-medium leading-tight text-ink/80">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured deals */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today's deals</h2>
          <Link to="/search" className="text-sm font-medium text-brand-500 hover:underline">
            View all →
          </Link>
        </div>

        {loading && <Spinner label="Loading deals" />}
        {error && <Banner type="error">{error}</Banner>}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
