import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import * as orderService from '../services/orderService';
import { isPaid } from '../utils/format';
import OrderView from '../components/orders/OrderView';
import StateMessage from '../components/common/StateMessage';
import styles from './Account.module.css';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { data: order, loading, error, reload } = useFetch((s) => orderService.getOne(orderId, s), [orderId]);

  if (loading) return <StateMessage type="loading" />;
  if (error) return <StateMessage type="error" message={error.message} onRetry={reload} />;
  if (!order) return <StateMessage title="Order not found" />;

  // The payment status shown here is what the server has stored, not the browser's state.
  const paid = isPaid(order.paymentStatus);

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-6)' }}>
      <h1 className={styles.title}>{paid ? 'Thank you! Your payment is confirmed' : 'Your order has been received'}</h1>
      {!paid && (
        <div className="alert-error" role="status" style={{ marginBottom: 'var(--space-5)' }}>
          Payment is not confirmed on the server yet (status: {order.paymentStatus}). If you were charged, please do not
          pay again. Check <Link to="/account/orders"><strong>My orders</strong></Link> shortly or contact support.
        </div>
      )}
      <OrderView order={order} />
      <div className={styles.actions}>
        <Link to="/account/orders" className="btn btn-secondary">View my orders</Link>
        <Link to="/products" className="btn btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
