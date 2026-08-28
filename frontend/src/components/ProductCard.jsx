import { Link } from 'react-router-dom';
import { useState } from 'react';
import StarRating from './StarRating';
import { formatINR } from '../utils/format';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product, 1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/product/${product.slug}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-cream">
        <img
          src={product.images?.[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-white">
            {discount}% off
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink">{product.title}</p>
        <StarRating value={product.ratingAverage} count={product.ratingCount} />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="price text-base font-semibold text-ink">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="price text-xs text-ink/40 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || adding}
          className="btn-primary mt-2 w-full py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? 'Adding…' : product.stock === 0 ? 'Unavailable' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
}
