import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/StarRating';
import { formatINR } from '../utils/format';
import { Spinner, Banner } from '../components/Feedback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setActiveImage(0);
        setQty(1);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product, qty);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMsg('');
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
      setReviewMsg('success:Review submitted — thanks for your feedback!');
    } catch (err) {
      setReviewMsg(`error:${err.response?.data?.message || 'Could not submit review'}`);
    }
  };

  if (loading) return <Spinner label="Loading product" />;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Banner type="error">{error}</Banner>
        <Link to="/" className="btn-outline mt-4 inline-flex">Back to home</Link>
      </div>
    );
  }

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-6 text-sm text-ink/50">
        <Link to="/" className="hover:text-brand-500">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/search?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-500">
          {product.category}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="card aspect-square overflow-hidden">
            <img
              src={product.images[activeImage]}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-brand-500">{product.brand}</p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{product.title}</h1>
          <div className="mt-2">
            <StarRating value={product.ratingAverage} count={product.ratingCount} size="lg" />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="price text-3xl font-bold">{formatINR(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="price text-ink/40 line-through">{formatINR(product.mrp)}</span>
                <span className="font-semibold text-success">{discount}% off</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/50">Inclusive of all taxes</p>

          <p className="mt-5 leading-relaxed text-ink/80">{product.description}</p>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 font-semibold">Specifications</h3>
              <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink/50">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <label htmlFor="qty" className="text-sm font-medium">Qty</label>
            <select
              id="qty"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="input w-20"
            >
              {Array.from({ length: Math.min(10, product.stock || 1) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-sm text-ink/50">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className="btn-outline flex-1 disabled:opacity-40"
            >
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14 max-w-2xl">
        <h2 className="mb-4 text-xl font-semibold">Ratings &amp; Reviews</h2>

        {product.reviews.length === 0 && (
          <p className="text-sm text-ink/50">No reviews yet — be the first to review this product.</p>
        )}
        <ul className="space-y-4">
          {product.reviews.map((r, i) => (
            <li key={i} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.name}</span>
                <StarRating value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink/70">{r.comment}</p>}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          {user ? (
            <form onSubmit={submitReview} className="card space-y-3 p-4">
              <h3 className="font-semibold">Write a review</h3>
              <div className="flex items-center gap-2">
                <label htmlFor="rating" className="text-sm">Rating</label>
                <select
                  id="rating"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  className="input w-20"
                >
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience with this product"
                className="input min-h-[80px]"
              />
              <button type="submit" className="btn-secondary">Submit review</button>
              {reviewMsg && (
                <Banner type={reviewMsg.startsWith('success') ? 'success' : 'error'}>
                  {reviewMsg.split(':').slice(1).join(':')}
                </Banner>
              )}
            </form>
          ) : (
            <p className="text-sm text-ink/50">
              <Link to="/login" className="text-brand-500 hover:underline">Sign in</Link> to write a review.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
