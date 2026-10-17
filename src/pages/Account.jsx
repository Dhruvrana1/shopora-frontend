
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { call } from '../services/api';
import styles from './Account.module.css';

export default function Account() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');

        const data = await call(
          { method: 'GET', path: '/auth/profile' },
          { auth: true, signal: controller.signal }
        );

        setProfile(data?.user ?? null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Could not load your profile.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/');
    }
  };

  return (
    <div
      className="container"
      style={{ paddingBlock: 'var(--space-6)' }}
    >
      <h1 className={styles.title}>My account</h1>

      <div
        className={styles.cards}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        <section
          className={styles.card}
          style={{ minWidth: 0 }}
        >
          <h2>Orders</h2>
          <p>View your past orders and their payment status.</p>

          <Link
            to="/account/orders"
            className="btn btn-primary"
          >
            View orders
          </Link>
        </section>

        <section
          className={styles.card}
          style={{ minWidth: 0, overflowWrap: 'anywhere' }}
        >
          <h2>Profile</h2>

          {loading && <p>Loading your profile...</p>}

          {!loading && error && (
            <p role="alert">{error}</p>
          )}

          {!loading && !error && profile && (
            <>
              <p>
                <strong>Name:</strong>{' '}
                {[profile.first_name, profile.last_name]
                  .filter(Boolean)
                  .join(' ') || 'Not provided'}
              </p>

              <p>
                <strong>Email:</strong>{' '}
                {profile.email || 'Not provided'}
              </p>

              <p>
                <strong>Mobile:</strong>{' '}
                {profile.mobile || 'Not provided'}
              </p>
            </>
          )}

          {!loading && !error && !profile && (
            <p>Profile information could not be found.</p>
          )}
        </section>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .account-cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
