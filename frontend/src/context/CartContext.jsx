import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'kartify_guest_cart';

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};
const writeGuestCart = (items) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]); // normalized: [{ product, qty, lineTotal }]
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + (i.lineTotal ?? i.product.price * i.qty), 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const fetchServerCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGuestCartAsItems = () => {
    setItems(
      readGuestCart().map((g) => ({
        product: g.product,
        qty: g.qty,
        lineTotal: Number((g.product.price * g.qty).toFixed(2)),
      }))
    );
  };

  // On mount / auth change: load the right cart, and merge guest -> server on login
  useEffect(() => {
    const sync = async () => {
      if (user) {
        const guestItems = readGuestCart();
        if (guestItems.length > 0) {
          await Promise.all(
            guestItems.map((g) => api.post('/cart', { productId: g.product._id, qty: g.qty }))
          );
          writeGuestCart([]);
        }
        await fetchServerCart();
      } else {
        loadGuestCartAsItems();
      }
    };
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addToCart = async (product, qty = 1) => {
    if (user) {
      const { data } = await api.post('/cart', { productId: product._id, qty });
      setItems(data.items);
    } else {
      const guestItems = readGuestCart();
      const existing = guestItems.find((g) => g.product._id === product._id);
      if (existing) existing.qty = qty;
      else guestItems.push({ product, qty });
      writeGuestCart(guestItems);
      loadGuestCartAsItems();
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      const { data } = await api.delete(`/cart/${productId}`);
      setItems(data.items);
    } else {
      const guestItems = readGuestCart().filter((g) => g.product._id !== productId);
      writeGuestCart(guestItems);
      loadGuestCartAsItems();
    }
  };

  const clearCart = async () => {
    if (user) {
      await api.delete('/cart');
    } else {
      writeGuestCart([]);
    }
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{ items, subtotal, itemCount, loading, addToCart, removeFromCart, clearCart, refresh: fetchServerCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
