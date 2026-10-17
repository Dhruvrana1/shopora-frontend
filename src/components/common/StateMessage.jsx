import styles from './StateMessage.module.css';

export default function StateMessage({ type = 'empty', title, message, onRetry }) {
  return (
    <div className={styles.wrap} role={type === 'error' ? 'alert' : 'status'}>
      {type === 'loading' && <span className={styles.spinner} aria-hidden="true" />}
      <p className={styles.title}>
        {title || (type === 'loading' ? 'Loading…' : type === 'error' ? 'Something went wrong' : 'Nothing here yet')}
      </p>
      {message && <p className={styles.message}>{message}</p>}
      {type === 'error' && onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
