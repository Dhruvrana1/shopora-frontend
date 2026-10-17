import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import * as productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import StateMessage from '../components/common/StateMessage';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { productKey } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const { data: product, loading, error, reload } = useFetch((s) => productService.getOne(productKey, s), [productKey]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, text }

  if (loading) return <StateMessage type="loading" />;
  if (error) {
    return (
      <StateMessage
        type="error"
        title={error.status === 404 ? 'Product not found' : undefined}
        message={error.message}
        onRetry={error.status === 404 ? undefined : reload}
      />
    );
  }
  if (!product) return <StateMessage title="Product not found" />;

  const outOfStock = product.stock !== null && product.stock <= 0;
  const maxQty = product.stock !== null ? product.stock : 99;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await addItem(product.id, qty);
      setFeedback({ type: 'success', text: 'Added to your cart.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const image = product.images[activeImg];

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-6)' }}>
      <nav aria-label="Breadcrumb" className={styles.crumbs}>
        <Link to="/products">Products</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        <div>
          <div className={styles.mainImg}>
            {image ? <img src={image} alt={product.name} /> : <div className={styles.placeholder}>{product.name.charAt(0)}</div>}
          </div>
          {product.images.length > 1 && (
            <ul className={styles.thumbs}>
              {product.images.map((src, i) => (
                <li key={src + i}>
                  <button
                    type="button"
                    className={i === activeImg ? styles.thumbOn : styles.thumb}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-pressed={i === activeImg}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.info}>
          {product.categoryName && <p className={styles.category}>{product.categoryName}</p>}
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>

          <p className={outOfStock ? styles.out : styles.stock}>
            {outOfStock ? 'Out of stock' : product.stock !== null ? `${product.stock} in stock` : 'Available'}
          </p>

          {product.description && <p className={styles.desc}>{product.description}</p>}
          {product.sku && <p className={styles.sku}>SKU: {product.sku}</p>}

          <div className={styles.buy}>
            <div className={styles.qty} role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1 || outOfStock} aria-label="Decrease quantity">−</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty || outOfStock} aria-label="Increase quantity">+</button>
            </div>
            <button
              type="button"
              className={`btn btn-primary btn-lg ${feedback?.type === 'success' ? styles.added : ''}`}
              onClick={handleAdd}
              disabled={outOfStock || busy}
            >
              {outOfStock ? 'Out of stock' : busy ? 'Adding…' : feedback?.type === 'success' ? 'Added ✓' : 'Add to cart'}
            </button>
          </div>

          {feedback && (
            <div className={feedback.type === 'error' ? 'alert-error' : 'alert-success'} role={feedback.type === 'error' ? 'alert' : 'status'} style={{ marginTop: 'var(--space-4)' }}>
              {feedback.text} {feedback.type === 'success' && <Link to="/cart"><strong>View cart</strong></Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
