
import { call, ENDPOINTS } from './api';
import { PAYLOADS } from './endpoints';
import { normalizeOrder } from '../utils/adapters';

// Create an order and extract its ID from the API response.
export async function createOrder(input) {
  const data = await call(ENDPOINTS.orders.create, {
    body: PAYLOADS.orderCreate(input),
  });

  const rawOrder =
    data?.Order ??
    data?.order ??
    data?.orderId ??
    data?.data?.Order ??
    data?.data?.order ??
    data?.data;

  const order = normalizeOrder(rawOrder);

  if (!order?.id) {
    console.error('Create order response:', data);
    throw new Error(
      'The order was created, but its ID could not be read. Check the browser console.'
    );
  }

  return order;
}

// Fetch all orders for the logged-in customer.
export async function list(signal) {
  const data = await call(ENDPOINTS.orders.list, { signal });

  const orders =
    data?.orders ??
    data?.Order ??
    data?.order ??
    data?.data?.orders ??
    data?.data?.Order ??
    [];

  return Array.isArray(orders)
    ? orders.map(normalizeOrder)
    : [];
}

// Fetch one order by ID.
export async function getOne(id, signal) {
  const data = await call(ENDPOINTS.orders.detail, {
    args: [id],
    signal,
  });

  return normalizeOrder(
    data?.orderId ??
    data?.Order ??
    data?.order ??
    data?.data?.order ??
    data?.data?.Order ??
    data?.data
  );
}
