import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import ProductCard from '../components/products/ProductCard';
import ProductSkeleton from '../components/products/ProductSkeleton';
import StateMessage from '../components/common/StateMessage';
import Reveal from '../components/common/Reveal';
import styles from './Home.module.css';

const Arrow = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function Home() {
  const { isAuthenticated } = useAuth();
  const railRef = useRef(null);
  const cats = useFetch((s) => categoryService.list(s), []);
  // No "featured" flag exists in the backend: the first products returned are shown.
  const products = useFetch((s) => productService.list({ limit: 12 }, s), []);

  const items = products.data?.items || [];
  const shots = items.filter((p) => p.images.length > 0).slice(0, 3);
  const featured = items.slice(0, 5);
  const more = items.slice(5);
  const scrollRail = (dir) => railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.shapes} aria-hidden="true" />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.copy}>
            <h1 className={styles.title}>
              <span className={styles.line}><span>Shop</span></span>
              <span className={styles.line}><span>the whole</span></span>
              <span className={styles.line}><span>store.</span></span>
            </h1>
            <p className={styles.lead}>Everything in the Shopora catalogue, sorted by category and ready for checkout.</p>
            <div className={styles.cta}>
              <Link to="/products" className="btn btn-light btn-lg">Shop all products</Link>
              <a href="#categories" className="btn btn-ghost btn-lg">Browse categories</a>
            </div>
          </div>

          <div className={styles.stage} aria-label="Products from the catalogue">
            {shots.map((p, i) => (
              <Link key={p.id ?? p.routeKey} to={`/products/${p.routeKey}`} className={`${styles.shot} ${styles[`shot${i}`]}`}>
                <img src={p.images[0]} alt={p.name} />
                <span className={styles.tag}><b>{p.name}</b><span>{formatPrice(p.price)}</span></span>
              </Link>
            ))}
            {!products.loading && shots.length === 0 && <div className={styles.fallback} aria-hidden="true">S</div>}
          </div>
        </div>
      </section>

      <Reveal as="section" id="categories" className={`container ${styles.section} ${styles.firstSection}`} aria-labelledby="cat-h">
        <div className={styles.head}><h2 id="cat-h" className={styles.h2}>Shop by category</h2></div>
        {cats.loading && <StateMessage type="loading" />}
        {cats.error && <StateMessage type="error" message={cats.error.message} onRetry={cats.reload} />}
        {cats.data && cats.data.length === 0 && <StateMessage title="No categories yet" />}
        {cats.data && cats.data.length > 0 && (
          <ul className={styles.index}>
            {cats.data.map((c) => (
              <li key={c.id ?? c.routeKey}>
                <Link to={`/category/${c.routeKey}`} className={styles.row}>
                  <span className={styles.rowName}>{c.name}</span>
                  {c.image && <img className={styles.peek} src={c.image} alt="" loading="lazy" />}
                  <span className={styles.rowGo}>Shop <Arrow /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <section className={`container ${styles.section}`} aria-labelledby="feat-h">
        <div className={styles.head}>
          <h2 id="feat-h" className={styles.h2}>Featured</h2>
          <Link to="/products" className={styles.more}>View all</Link>
        </div>
        {products.loading && <ProductSkeleton count={5} className={styles.featGrid} />}
        {products.error && <StateMessage type="error" message={products.error.message} onRetry={products.reload} />}
        {products.data && items.length === 0 && <StateMessage title="No products yet" message="Check back soon." />}
        {featured.length > 0 && (
          <div className={styles.featGrid}>
            {featured.map((p, i) => (
              <ProductCard key={p.id ?? p.routeKey} product={p} index={i} variant={i === 0 ? 'feature' : undefined} />
            ))}
          </div>
        )}
      </section>

      <Reveal as="section" className={`container ${styles.section}`} aria-label="Account">
        <div className={styles.promo}>
          <h2 className={styles.promoTitle}>{isAuthenticated ? 'Your orders, in one place.' : 'Join Shopora to check out.'}</h2>
          <div className={styles.promoSide}>
            <p>
              {isAuthenticated
                ? 'Follow every order and its payment status from your account.'
                : 'Create an account to keep a cart, place orders and follow them from your account page.'}
            </p>
            <div className={styles.promoCta}>
              {isAuthenticated ? (
                <Link to="/account/orders" className="btn btn-primary btn-lg">View my orders</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Create account</Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">Log in</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {more.length > 0 && (
        <section className={styles.section} aria-labelledby="more-h">
          <div className={`container ${styles.head}`}>
            <h2 id="more-h" className={styles.h2}>More to explore</h2>
            <div className={styles.arrows}>
              <button type="button" onClick={() => scrollRail(-1)} aria-label="Scroll back">←</button>
              <button type="button" onClick={() => scrollRail(1)} aria-label="Scroll forward">→</button>
            </div>
          </div>
          <div ref={railRef} className={styles.rail} tabIndex={0} aria-label="More products">
            {more.map((p, i) => (
              <div key={p.id ?? p.routeKey} className={styles.railItem}><ProductCard product={p} index={i} /></div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
