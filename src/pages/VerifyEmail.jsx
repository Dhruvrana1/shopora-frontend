
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StateMessage from '../components/common/StateMessage';
import styles from './Auth.module.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromToken } = useAuth();

  const verified = searchParams.get('verified');
  const accessToken = searchParams.get('accessToken');

  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (verified !== 'true' || !accessToken) {
      setError(
        'This verification link is invalid or missing its session token.'
      );
      return;
    }

    const success = setUserFromToken(accessToken);

    if (!success) {
      setError(
        'Your email was verified, but automatic login failed. Please log in manually.'
      );
      return;
    }

    // Remove the token from the address bar before navigating home.
    window.history.replaceState({}, document.title, '/verify-email');

    navigate('/', { replace: true });
  }, [verified, accessToken, setUserFromToken, navigate]);

  if (error) {
    return (
      <div className="container">
        <div className={styles.wrap}>
          <h1 className={styles.title}>Email verification</h1>
          <div className="alert-error" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>Email verification</h1>
        <StateMessage
          type="loading"
          title="Verifying your email and signing you in…"
        />
      </div>
    </div>
  );
}
