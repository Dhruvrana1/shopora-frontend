
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useInView from '../../hooks/useInView';
import { formatPrice } from '../../utils/format';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0, variant }) {
  const [ref, seen] = useInView();
  const [imageFailed, setImageFailed] = useState(false);

  const to = `/products/${product.routeKey}`;
  const outOfStock = product.stock !== null && product.stock <= 0;
  const lowStock =
    product.stock !== null &&
    product.stock > 0 &&
    product.stock <= 5;

  // Accept image URLs stored as strings or objects.
  const images = Array.isArray(product.images)
    ? product.images
        .map((image) =>
          typeof image === 'string'
            ? image
            : image?.image_url || image?.url
        )
        .filter(
          (url) =>
            typeof url === 'string' && url.trim().length > 0
        )
    : [];

  const [primary, secondary] = images;
  console.log('Product card data:', product.name, product.images);
  console.log('Primary image URL:', primary);

  const cls = [
    styles.card,
    seen && styles.seen,
    variant === 'feature' && styles.feature,
    outOfStock && styles.dim,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      ref={ref}
      className={cls}
      style={{ '--i': index % 4 }}
    >
      <div className={styles.media}>
        {primary && !imageFailed ? (
          <img
            key={primary}
            className={styles.main}
            src={primary}
            alt={product.name || 'Product'}
            loading="lazy"
            onLoad={() => {
              console.log('Product image loaded:', product.name);
            }}
            onError={() => {
              console.error(
                'Product image failed:',
                product.name,
                primary
              );
              setImageFailed(true);
            }}
          />
        ) : (
          <div className={styles.placeholder}>
            {product.name?.charAt(0) || '?'}
          </div>
        )}

        {secondary && (
          <img
            className={styles.alt}
            src={secondary}
            alt={`${product.name || 'Product'} alternate view`}
            loading="lazy"
            onError={(event) => {
              console.error(
                'Alternate image failed:',
                product.name,
                secondary
              );
              event.currentTarget.style.display = 'none';
            }}
          />
        )}

        {outOfStock && (
          <span className={`${styles.badge} ${styles.badgeDark}`}>
            Out of stock
          </span>
        )}

        {lowStock && (
          <span className={`${styles.badge} ${styles.badgeHot}`}>
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className={styles.body}>
        {product.categoryName && (
          <p className={styles.category}>{product.categoryName}</p>
        )}

        <h3 className={styles.name}>
          <Link to={to}>{product.name}</Link>
        </h3>

        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>

      <div className={styles.cta} aria-hidden="true">
        <span>View product</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </article>
  );
}
