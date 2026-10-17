import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/forms/Field';
import styles from './Auth.module.css';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!values.email.trim() || !values.password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login({ email: values.email.trim(), password: values.password });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.sub}>Welcome back to Shopora.</p>
        {error && <div className={`alert-error ${styles.alert}`} role="alert">{error}</div>}
        <form onSubmit={onSubmit} noValidate>
          <Field id="email" name="email" type="email" label="Email" autoComplete="email" value={values.email} onChange={onChange} required />
          <Field id="password" name="password" type="password" label="Password" autoComplete="current-password" value={values.password} onChange={onChange} required />
          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <div className={styles.links}>
          <Link to="/forgot-password">Forgot password?</Link>
          <span>New here? <Link to="/register">Create an account</Link></span>
        </div>
      </div>
    </div>
  );
}
