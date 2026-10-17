import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import StateMessage from '../components/common/StateMessage';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, cart, loading, error, refresh, updateItem, removeItem } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);

  const run = async (id, fn) => {
    if (busyId) return;
    setBusyId(id);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading && items.length === 0) return <StateMessage type="loading" />;
  if (error && items.length === 0) return <StateMessage type="error" message={error.message} onRetry={refresh} />;
  if (items.length === 0) {
    return (
      <div className="container">
        <StateMessage title="Your cart is empty" message="Add something you like and it will appear here." />
        <p style={{ textAlign: 'center' }}><Link to="/products" className="btn btn-primary">Continue shopping</Link></p>
      </div>
    );
  }

  const overStock = items.some((i) => i.stock !== null && i.quantity > i.stock);

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-6)' }}>
      <h1 className={styles.title}>Your cart</h1>
      {message && <div className="alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>{message}</div>}
      <div className={styles.layout}>
        <ul className={styles.list}>
          {items.map((i) => {
            const busy = busyId === i.id;
            const max = i.stock !== null ? i.stock : 99;
            return (
              <li key={i.id} className={styles.item}>
                <Link to={`/products/${i.productKey}`} className={styles.thumb} aria-hidden="true" tabIndex={-1}>
                  {i.image ? <img src={i.image} alt="" loading="lazy" /> : <span>{i.name.charAt(0)}</span>}
                </Link>
                <div className={styles.info}>
                  <Link to={`/products/${i.productKey}`} className={styles.name}>{i.name}</Link>
                  <p className={styles.price}>{formatPrice(i.price)}</p>
                  {i.stock !== null && i.quantity > i.stock && (
                    <p className={styles.warn}>Only {i.stock} in stock. Lower the quantity to check out.</p>
                  )}
                  <div className={styles.actions}>
                    <div className={styles.qty} role="group" aria-label={`Quantity for ${i.name}`}>
                      <button type="button" disabled={busy || i.quantity <= 1} onClick={() => run(i.id, () => updateItem(i.id, i.quantity - 1))} aria-label="Decrease quantity">−</button>
                      <span aria-live="polite">{i.quantity}</span>
                      <button type="button" disabled={busy || i.quantity >= max} onClick={() => run(i.id, () => updateItem(i.id, i.quantity + 1))} aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" className={styles.remove} disabled={busy} onClick={() => run(i.id, () => removeItem(i.id))}>Remove</button>
                  </div>
                </div>
                <p className={styles.line}>{formatPrice((i.price || 0) * i.quantity)}</p>
              </li>
            );
          })}
        </ul>

        <aside className={styles.summary} aria-label="Order summary">
          <h2>Order summary</h2>
          <div className={styles.row}><span>Subtotal</span><strong>{formatPrice(cart.subtotal)}</strong></div>
          <p className={styles.note}>The final total is confirmed by the server when you place your order.</p>
          {overStock ? (
            <button className="btn btn-primary" disabled>Proceed to checkout</button>
          ) : (
            <Link to="/checkout" className="btn btn-primary">Proceed to checkout</Link>
          )}
          <Link to="/products" className={styles.continue}>Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
