import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import { SORT_OPTIONS, PAGE_SIZE } from '../services/endpoints';
import ProductCard from '../components/products/ProductCard';
import ProductSkeleton from '../components/products/ProductSkeleton';
import StateMessage from '../components/common/StateMessage';
import styles from './ProductList.module.css';

export default function ProductList() {
  const { categoryKey } = useParams();
  const [sp, setSp] = useSearchParams();
  const search = sp.get('search') || '';
  const sort = sp.get('sort') || '';
  const [visible, setVisible] = useState(PAGE_SIZE);

  const cats = useFetch((s) => categoryService.list(s), []);
  const { data, loading, error, reload } = useFetch(
    (s) => productService.list({ search, category: categoryKey, sort }, s),
    [search, categoryKey, sort]
  );

  useEffect(() => setVisible(PAGE_SIZE), [search, categoryKey, sort]);

  const setSort = (value) => {
    const next = new URLSearchParams(sp);
    if (value) next.set('sort', value);
    else next.delete('sort');
    setSp(next);
  };

  const activeCategory = (cats.data || []).find((c) => String(c.routeKey) === String(categoryKey));
  const heading = search ? `“${search}”` : activeCategory?.name || (categoryKey ? 'Category' : 'All products');
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';

  return (
    <>
      <section className={styles.band}>
        <div className={`container ${styles.bandInner}`}>
          <h1 className={styles.title}>{heading}</h1>
          {data && <p className={styles.count}>{data.total} product{data.total === 1 ? '' : 's'}{search ? ' found' : ''}</p>}
        </div>
      </section>

      <div className="container" style={{ paddingBlock: 'var(--space-6) 0' }}>
        <div className={styles.toolbar}>
          <ul className={styles.chips} aria-label="Filter by category">
            <li><Link to={`/products${qs}`} className={!categoryKey ? styles.chipOn : styles.chip}>All</Link></li>
            {(cats.data || []).map((c) => (
              <li key={c.id ?? c.routeKey}>
                <Link to={`/category/${c.routeKey}${qs}`} className={String(c.routeKey) === String(categoryKey) ? styles.chipOn : styles.chip}>{c.name}</Link>
              </li>
            ))}
          </ul>
          <div className={styles.sort}>
            <label htmlFor="sort" className="visually-hidden">Sort products</label>
            <select id="sort" className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort by</option>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading && <ProductSkeleton count={8} className={styles.grid} />}
        {error && <StateMessage type="error" message={error.message} onRetry={reload} />}
        {data && data.items.length === 0 && <StateMessage title="No products found" message="Try a different search or category." />}
        {data && data.items.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.items.slice(0, visible).map((p, i) => <ProductCard key={p.id ?? p.routeKey} product={p} index={i} />)}
            </div>
            {visible < data.items.length && (
              <div className={styles.more}>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Load more</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
