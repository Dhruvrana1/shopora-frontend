import { addressLines, formatDate, formatPrice, isPaid, label } from '../../utils/format';
import styles from './OrderView.module.css';

export default function OrderView({ order }) {
  const ship = addressLines(order.shippingAddress);
  return (
    <div className={styles.wrap}>
      <dl className={styles.meta}>
        <div><dt>Order number</dt><dd>{order.orderNumber}</dd></div>
        <div><dt>Placed</dt><dd>{formatDate(order.createdAt)}</dd></div>
        <div><dt>Order status</dt><dd>{label(order.orderStatus)}</dd></div>
        <div>
          <dt>Payment</dt>
          <dd><span className={isPaid(order.paymentStatus) ? styles.paid : styles.unpaid}>{label(order.paymentStatus)}</span></dd>
        </div>
      </dl>

      <section aria-labelledby="items-h">
        <h2 id="items-h" className={styles.h}>Items</h2>
        {order.items.length === 0 ? (
          <p className={styles.note}>Item details are not included in the order response from the server.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {order.items.map((i, idx) => (
                  <tr key={`${i.id}-${idx}`}>
                    <td>{i.name}{i.sku && <span className={styles.sku}> · {i.sku}</span>}</td>
                    <td>{i.quantity}</td>
                    <td>{formatPrice(i.price)}</td>
                    <td>{formatPrice(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.totals} aria-label="Order totals">
        <div><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
        <div><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
        <div><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
        <div className={styles.grand}><span>Total</span><span>{formatPrice(order.total)}</span></div>
      </section>

      {ship.length > 0 && (
        <section>
          <h2 className={styles.h}>Shipping address</h2>
          <address className={styles.addr}>{ship.map((l, i) => <span key={i}>{l}</span>)}</address>
        </section>
      )}
    </div>
  );
}
