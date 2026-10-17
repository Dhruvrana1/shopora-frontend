import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import * as orderService from '../services/orderService';
import * as paymentService from '../services/paymentService';
import { CHECKOUT_DEFAULTS } from '../services/endpoints';
import { formatPrice } from '../utils/format';
import Field from '../components/forms/Field';
import StateMessage from '../components/common/StateMessage';
import styles from './Checkout.module.css';

// Address field names are a frontend choice (the backend has no address schema). VERIFY storage format.
const FIELDS = [
  ['full_name', 'Full name', 'name', true],
  ['phone', 'Phone number', 'tel', true],
  ['line1', 'Address line 1', 'address-line1', true],
  ['line2', 'Address line 2 (optional)', 'address-line2', false],
  ['city', 'City', 'address-level2', true],
  ['state', 'State', 'address-level1', true],
  ['postal_code', 'PIN code', 'postal-code', true],
  ['country', 'Country', 'country-name', true],
];

const makeOrderNumber = () =>
  `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, loading, removeItem } = useCart();
  const [form, setForm] = useState({ full_name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(false);

  const lock = useRef(false); // blocks double submits synchronously
  const orderNumber = useRef(makeOrderNumber()); // same number on retry so a duplicate order can't slip through silently
  const createdOrder = useRef(null); // reuse the saved order if payment is retried

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const total = subtotal + CHECKOUT_DEFAULTS.shippingCharge + CHECKOUT_DEFAULTS.tax;
  const blocked = items.some((i) => i.price === null || (i.stock !== null && i.quantity > i.stock));

  const validate = () => {
    const e = {};
    FIELDS.forEach(([key, , , required]) => {
      if (required && !form[key].trim()) e[key] = 'Required';
    });
    if (form.phone && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (lock.current) return;
    if (!createdOrder.current) {
      const e = validate();
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    lock.current = true;
    setBusy(true);
    setError(null);
    const snapshot = [...items];
    try {
      let order = createdOrder.current;
      if (!order) {
        const address = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
        order = await orderService.createOrder({ orderNumber: orderNumber.current, address, items: snapshot, subtotal, total });
        if (!order?.id) throw new Error('The order was created but the server did not return its id.');
        createdOrder.current = order;
        setCreated(true);
      }

      await paymentService.loadRazorpay();
      // Use the amount stored on the order by the server, not the browser's own total.
      const rzpOrder = await paymentService.createPayment(order.id, order.total ?? total);
      const response = await paymentService.openRazorpay(rzpOrder);

      try {
        await paymentService.verifyPayment(order.id, response);
      } catch {
        // Money may have been taken. Show the real status from the server instead of guessing.
        navigate(`/order-confirmation/${order.id}`, { replace: true });
        return;
      }

      for (const item of snapshot) {
        try { await removeItem(item.id); } catch { /* best effort: no clear-cart route exists */ }
      }
      navigate(`/order-confirmation/${order.id}`, { replace: true });
    } catch (err) {
      setError(
        err.cancelled
          ? 'Payment was not completed. Your order is saved. Select "Pay now" to try again.'
          : err.message
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  if (loading && items.length === 0) return <StateMessage type="loading" />;
  if (!created && items.length === 0) {
    return (
      <div className="container">
        <StateMessage title="Your cart is empty" message="Add items before checking out." />
        <p style={{ textAlign: 'center' }}><Link to="/products" className="btn btn-primary">Continue shopping</Link></p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-6)' }}>
      <h1 className={styles.title}>Checkout</h1>
      <form className={styles.layout} onSubmit={onSubmit} noValidate>
        <section aria-labelledby="addr-h">
          <h2 id="addr-h" className={styles.h}>Delivery address</h2>
          <fieldset className={styles.fieldset} disabled={busy || created}>
            <div className={styles.grid}>
              {FIELDS.map(([key, text, auto, required]) => (
                <div key={key} className={key === 'line1' || key === 'line2' || key === 'full_name' ? styles.wide : undefined}>
                  <Field
                    id={key}
                    label={text}
                    autoComplete={auto}
                    required={required}
                    value={form[key]}
                    error={errors[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </fieldset>
          <p className={styles.note}>Your billing address will be the same as the delivery address.</p>
        </section>

        <aside className={styles.summary} aria-label="Order summary">
          <h2 className={styles.h}>Order summary</h2>
          <ul className={styles.items}>
            {items.map((i) => (
              <li key={i.id}><span>{i.name} × {i.quantity}</span><span>{formatPrice((i.price || 0) * i.quantity)}</span></li>
            ))}
          </ul>
          <div className={styles.row}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className={styles.row}><span>Shipping</span><span>{formatPrice(CHECKOUT_DEFAULTS.shippingCharge)}</span></div>
          <div className={styles.row}><span>Tax</span><span>{formatPrice(CHECKOUT_DEFAULTS.tax)}</span></div>
          <div className={`${styles.row} ${styles.total}`}><span>Total</span><span>{formatPrice(total)}</span></div>

          {blocked && <div className="alert-error" role="alert">An item has no price or exceeds available stock. <Link to="/cart"><strong>Review cart</strong></Link></div>}
          {error && <div className="alert-error" role="alert">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={busy || blocked}>
            {busy ? 'Processing…' : created ? 'Pay now' : 'Place order & pay'}
          </button>
          <p className={styles.note}>Payments are processed securely by Razorpay.</p>
        </aside>
      </form>
    </div>
  );
}
