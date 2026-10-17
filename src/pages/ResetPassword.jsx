import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as authService from '../services/authService';
import Field from '../components/forms/Field';
import styles from './Auth.module.css';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const v = {};
    if (password.length < 8) v.password = 'Use at least 8 characters';
    if (confirm !== password) v.confirm = 'Passwords do not match';
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setError(null);
    try {
      await authService.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(err.status === 400 ? 'This reset link is invalid or has expired. Please request a new one.' : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>Choose a new password</h1>
        {done ? (
          <>
            <div className={`alert-success ${styles.alert}`} role="status">Your password has been reset.</div>
            <Link to="/login" className="btn btn-primary">Log in</Link>
          </>
        ) : (
          <>
            {error && (
              <div className={`alert-error ${styles.alert}`} role="alert">
                {error} <Link to="/forgot-password"><strong>Request new link</strong></Link>
              </div>
            )}
            <form onSubmit={onSubmit} noValidate>
              <Field id="password" type="password" label="New password" autoComplete="new-password" hint="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
              <Field id="confirm" type="password" label="Confirm new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} required />
              <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={busy}>
                {busy ? 'Saving…' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
