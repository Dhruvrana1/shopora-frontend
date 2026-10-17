import styles from './Field.module.css';

export default function Field({ id, label, error, hint, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        {...props}
      />
      {hint && <span className={styles.hint}>{hint}</span>}
      {error && <span id={`${id}-err`} className={styles.err}>{error}</span>}
    </div>
  );
}
