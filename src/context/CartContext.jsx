import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const EMPTY = { items: [], subtotal: 0, subtotalFromServer: false };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bump, setBump] = useState(0);

  // The server cart is the single source of truth: always re-fetch after changes.
  const refresh = useCallback(async () => {
    if (!user) {
      setCart(EMPTY);
      return;
    }
    setLoading(true);
    try {
      setCart(await cartService.getCart());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (fn) => {
      await fn();
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      count: cart.items.reduce((n, i) => n + i.quantity, 0),
      loading,
      error,
      bump,
      refresh,
      addItem: async (productId, qty) => {
        await mutate(() => cartService.addItem(productId, qty));
        setBump((b) => b + 1);
      },
      updateItem: (itemId, qty) => mutate(() => cartService.updateItem(itemId, qty)),
      removeItem: (itemId) => mutate(() => cartService.removeItem(itemId)),
    }),
    [cart, loading, error, bump, refresh, mutate]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
