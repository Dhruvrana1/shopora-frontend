import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import * as categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const { data: categories } = useFetch((s) => categoryService.list(s), []);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.cta}`}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Find it. Love it. Cart it.</h2>
          <Link to="/products" className="btn btn-primary btn-lg">Shop all products</Link>
        </div>
      </div>

      <div className={`container ${styles.cols}`}>
        <nav aria-label="Shop">
          <h3 className={styles.heading}>Shop</h3>
          <ul>
            <li><Link to="/products">All products</Link></li>
            {(categories || []).slice(0, 6).map((c) => (
              <li key={c.id ?? c.routeKey}><Link to={`/category/${c.routeKey}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <h3 className={styles.heading}>Account</h3>
          <ul>
            {isAuthenticated ? (
              <>
                <li><Link to="/account">My account</Link></li>
                <li><Link to="/account/orders">My orders</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Log in</Link></li>
                <li><Link to="/register">Create account</Link></li>
              </>
            )}
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </nav>
      </div>

      <p className={styles.mark} aria-hidden="true">Shopora</p>
      <div className={styles.legal}>
        <div className="container">© {new Date().getFullYear()} Shopora. All rights reserved.</div>
      </div>
    </footer>
  );
}
