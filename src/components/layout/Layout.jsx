
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useCart } from '../../context/CartContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { pathname } = useLocation();
  const { bump } = useCart();
  const [toast, setToast] = useState(false);

  // Scroll to the top whenever the page changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Show a notification after an item is added to the cart.
  useEffect(() => {
    if (!bump) return undefined;

    setToast(true);

    const timer = setTimeout(() => {
      setToast(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, [bump]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to main content
      </a>

      <Header />

      <main id="main" className={styles.main}>
        <div key={pathname} className={styles.page}>
          <Outlet />
        </div>
      </main>

      <Footer />

      <div
        className={`${styles.toast} ${toast ? styles.toastOn : ''}`}
        role="status"
        aria-live="polite"
      >
        <span className={styles.tick} aria-hidden="true">
          ✓
        </span>

        <span>Added to your cart</span>

        <Link to="/cart" className={styles.toastLink}>
          View cart
        </Link>
      </div>
    </div>
  );
}
