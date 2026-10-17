import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import * as categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Header.module.css';

const icon = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { count, bump } = useCart();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const { data: categories } = useFetch((signal) => categoryService.list(signal), []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, searchOpen]);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const linkClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.on}` : styles.link);
  const list = categories || [];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.logo} aria-label="Shopora home">
          Shopora<span className={styles.dot} aria-hidden="true" />
        </Link>

        <nav className={styles.nav} aria-label="Categories">
          <NavLink to="/products" end className={linkClass}>All products</NavLink>
          {list.map((c) => (
            <NavLink key={c.id ?? c.routeKey} to={`/category/${c.routeKey}`} className={linkClass}>{c.name}</NavLink>
          ))}
        </nav>

        <div className={styles.tools}>
          <form
            className={`${styles.searchForm} ${searchOpen ? styles.searchOpen : ''}`}
            onSubmit={onSearch}
            role="search"
          >
            <label htmlFor="site-search" className="visually-hidden">Search products</label>
            <input
              id="site-search"
              ref={searchRef}
              className={styles.searchInput}
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.searchToggle}`}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
            onClick={() => (searchOpen && query.trim() ? onSearch({ preventDefault() {} }) : setSearchOpen((o) => !o))}
          >
            <svg {...icon}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>

          <Link to={isAuthenticated ? '/account' : '/login'} className={styles.account}>
            <svg {...icon}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
            <span className={styles.accountLabel}>{isAuthenticated ? 'Account' : 'Log in'}</span>
          </Link>

          {!isAuthenticated && (
            <Link to="/register" className={styles.signup}>Sign up</Link>
          )}

          <Link to="/cart" className={`${styles.iconBtn} ${styles.cart}`} aria-label={`Cart, ${count} items`}>
            <svg {...icon}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {count > 0 && <span key={bump} className={styles.badge}>{count}</span>}
          </Link>

          <button
            type="button"
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg {...icon}>{menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}</svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`${styles.panel} ${menuOpen ? styles.panelOpen : ''}`}>
        <div className={styles.panelInner}>
          <div className={`container ${styles.panelList}`}>
            <form className={styles.mSearch} onSubmit={onSearch} role="search" style={{ '--n': 0 }}>
              <label htmlFor="m-search" className="visually-hidden">Search products</label>
              <input id="m-search" type="search" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
            </form>
            <NavLink to="/products" end className={styles.panelLink} style={{ '--n': 1 }}>All products</NavLink>
            {list.map((c, i) => (
              <NavLink key={c.id ?? c.routeKey} to={`/category/${c.routeKey}`} className={styles.panelLink} style={{ '--n': i + 2 }}>{c.name}</NavLink>
            ))}
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={styles.panelLink} style={{ '--n': list.length + 2 }}>Log in</NavLink>
                <NavLink to="/register" className={styles.panelLink} style={{ '--n': list.length + 3 }}>Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
