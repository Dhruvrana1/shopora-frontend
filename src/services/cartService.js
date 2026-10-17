import { call, ENDPOINTS } from './api';
import { PAYLOADS } from './endpoints';
import { normalizeCart } from '../utils/adapters';
import { listAll } from './productService';

// GET /cart returns { cart, items }. VERIFY: whether items include product name/image.
// To be safe, product details are looked up from the product list by product_id.
export async function getCart(signal) {
  const [data, products] = await Promise.all([
    call(ENDPOINTS.cart.get, { signal }),
    listAll(signal).catch(() => []),
  ]);
  const byId = new Map(products.map((p) => [String(p.id), p]));
  return normalizeCart(data, byId);
}

export function addItem(productId, quantity) {
  return call(ENDPOINTS.cart.add, { body: PAYLOADS.cartAdd(productId, quantity) });
}

export function updateItem(itemId, quantity) {
  return call(ENDPOINTS.cart.update, { args: [itemId], body: PAYLOADS.cartUpdate(quantity) });
}

export function removeItem(itemId) {
  return call(ENDPOINTS.cart.remove, { args: [itemId] });
}
