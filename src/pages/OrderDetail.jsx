import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import * as orderService from '../services/orderService';
import OrderView from '../components/orders/OrderView';
import StateMessage from '../components/common/StateMessage';
import styles from './Account.module.css';

export default function OrderDetail() {
  const { orderId } = useParams();
  const { data: order, loading, error, reload } = useFetch((s) => orderService.getOne(orderId, s), [orderId]);

  if (loading) return <StateMessage type="loading" />;
  if (error) {
    return <StateMessage type="error" title={error.status === 404 ? 'Order not found' : undefined} message={error.message} onRetry={error.status === 404 ? undefined : reload} />;
  }
  if (!order) return <StateMessage title="Order not found" />;

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-6)' }}>
      <p className={styles.back}><Link to="/account/orders">← Back to orders</Link></p>
      <h1 className={styles.title}>Order {order.orderNumber}</h1>
      <OrderView order={order} />
    </div>
  );
}
