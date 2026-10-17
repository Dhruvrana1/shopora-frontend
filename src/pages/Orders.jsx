import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import * as orderService from '../services/orderService';
import { formatDate, formatPrice, isPaid, label } from '../utils/format';
import StateMessage from '../components/common/StateMessage';
import styles from './Account.module.css';

export default function Orders() {
  const { data: orders, loading, error, reload } = useFetch((s) => orderService.list(s), []);

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-6)' }}>
      <h1 className={styles.title}>My orders</h1>
      {loading && <StateMessage type="loading" />}
      {error && <StateMessage type="error" message={error.message} onRetry={reload} />}
      {orders && orders.length === 0 && (
        <>
          <StateMessage title="No orders yet" message="When you place an order it will appear here." />
          <p style={{ textAlign: 'center' }}><Link to="/products" className="btn btn-primary">Start shopping</Link></p>
        </>
      )}
      {orders && orders.length > 0 && (
        <ul className={styles.orders}>
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={`/account/orders/${o.id}`} className={styles.order}>
                <span className={styles.num}>{o.orderNumber}</span>
                <span className={styles.muted}>{formatDate(o.createdAt)}</span>
                <span>{label(o.orderStatus)}</span>
                <span className={isPaid(o.paymentStatus) ? styles.paid : styles.unpaid}>{label(o.paymentStatus)}</span>
                <strong>{formatPrice(o.total)}</strong>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
