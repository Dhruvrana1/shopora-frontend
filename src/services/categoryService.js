import { call, ENDPOINTS } from './api';
import { listFrom, normalizeCategory } from '../utils/adapters';

let pending = null;

export function list() {
  if (!pending) {
    pending = call(ENDPOINTS.categories.list, { auth: false })
      .then((data) => listFrom(data, 'categories').map(normalizeCategory))
      .catch((err) => {
        pending = null; // allow "Try again" to re-request
        throw err;
      });
  }
  return pending;
}
