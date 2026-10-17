import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/forms/Field';
import styles from './Auth.module.css';

const EMPTY = { firstName: '', lastName: '', email: '', mobile: '', password: '', confirm: '' };

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!values.firstName.trim()) e.firstName = 'Required';
    if (!values.lastName.trim()) e.lastName = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Enter a valid email address';
    if (values.password.length < 8) e.password = 'Use at least 8 characters';
    if (values.confirm !== values.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (busy) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setError(null);
    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        mobile: values.mobile.trim(),
        password: values.password,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="container">
        <div className={styles.wrap}>
          <h1 className={styles.title}>Account created</h1>
          <div className={`alert-success ${styles.alert}`} role="status">
            Your account has been created successfully! A verification email has been sent to your email address. Please check your inbox and spam folder to verify your account.
          </div>
          <Link to="/login" className="btn btn-primary">Go to log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.sub}>It only takes a minute.</p>
        {error && <div className={`alert-error ${styles.alert}`} role="alert">{error}</div>}
        <form onSubmit={onSubmit} noValidate>
          <div className={styles.row}>
            <Field id="firstName" name="firstName" label="First name" autoComplete="given-name" value={values.firstName} onChange={onChange} error={errors.firstName} required />
            <Field id="lastName" name="lastName" label="Last name" autoComplete="family-name" value={values.lastName} onChange={onChange} error={errors.lastName} required />
          </div>
          <Field id="email" name="email" type="email" label="Email" autoComplete="email" value={values.email} onChange={onChange} error={errors.email} required />
          <Field id="mobile" name="mobile" type="tel" label="Mobile (optional)" autoComplete="tel" value={values.mobile} onChange={onChange} />
          <Field id="password" name="password" type="password" label="Password" autoComplete="new-password" hint="At least 8 characters" value={values.password} onChange={onChange} error={errors.password} required />
          <Field id="confirm" name="confirm" type="password" label="Confirm password" autoComplete="new-password" value={values.confirm} onChange={onChange} error={errors.confirm} required />
          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div className={styles.links}><span>Already registered? <Link to="/login">Log in</Link></span></div>
      </div>
    </div>
  );
}
