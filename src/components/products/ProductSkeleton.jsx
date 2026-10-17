import styles from './ProductSkeleton.module.css';

export default function ProductSkeleton({ count = 8, className }) {
  return (
    <div className={className} role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.media} />
          <div className={styles.line} />
          <div className={`${styles.line} ${styles.short}`} />
        </div>
      ))}
    </div>
  );
}
