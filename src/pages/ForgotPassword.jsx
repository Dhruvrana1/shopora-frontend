import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authService from '../services/authService';
import Field from '../components/forms/Field';
import styles from './Auth.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>Forgot password</h1>
        <p className={styles.sub}>Enter your email and we'll request a reset link.</p>
        {sent ? (
          <div className="alert-success" role="status">Request sent. Check your inbox (and spam folder) for a reset link. It expires in 15 minutes.</div>
        ) : (
          <>
            {error && <div className={`alert-error ${styles.alert}`} role="alert">{error}</div>}
            <form onSubmit={onSubmit} noValidate>
              <Field id="email" type="email" label="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={busy}>
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
        <div className={styles.links}><Link to="/login">Back to log in</Link></div>
      </div>
    </div>
  );
}
