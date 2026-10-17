
/**
 * API endpoints for Shopora.
 */

export const ENDPOINTS = {
  auth: {
    register: { method: 'POST', path: '/auth/register' },
    login: { method: 'POST', path: '/auth/login' },
    refresh: { method: 'POST', path: '/auth/refresh' },
    logout: { method: 'POST', path: '/auth/logout' },
    profile: { method: 'GET', path: '/auth/profile' },
    forgotPassword: { method: 'POST', path: '/auth/forgot-password' },
    resetPassword: { method: 'POST', path: '/auth/reset-password' },
    verifyEmail: { method: 'GET', path: '/auth/verify-email' },
  },

  categories: {
    list: { method: 'GET', path: '/categories' },
    products: {
      method: 'GET',
      path: (slug) =>
        `/categories/${encodeURIComponent(slug)}/products`,
    },
  },

  products: {
    list: { method: 'GET', path: '/products' },
    detail: {
      method: 'GET',
      path: (slug) => `/products/${encodeURIComponent(slug)}`,
    },
  },

  cart: {
    get: { method: 'GET', path: '/cart' },
    add: { method: 'POST', path: '/cart/items' },
    update: {
      method: 'PUT',
      path: (id) => `/cart/items/${encodeURIComponent(id)}`,
    },
    remove: {
      method: 'DELETE',
      path: (id) => `/cart/items/${encodeURIComponent(id)}`,
    },
  },

  orders: {
    create: { method: 'POST', path: '/orders' },
    list: { method: 'GET', path: '/orders' },
    detail: {
      method: 'GET',
      path: (id) => `/orders/${encodeURIComponent(id)}`,
    },
  },

  payments: {
    create: { method: 'POST', path: '/payments/create' },
    verify: { method: 'POST', path: '/payments/verify' },
  },
};

// Default checkout values
export const CHECKOUT_DEFAULTS = {
  shippingCharge: 0,
  tax: 0,
  initialPaymentStatus: 'pending',
  initialOrderStatus: 'pending',
};

export const PAYLOADS = {
  register: ({ firstName, lastName, email, mobile, password }) => ({
    first_name: firstName,
    last_name: lastName,
    email,
    mobile: mobile || undefined,
    password,
  }),

  login: ({ email, password }) => ({ email, password }),

  forgotPassword: ({ email }) => ({ email }),

  resetPassword: ({ token, password }) => ({
    token,
    new_password: password,
  }),

  cartAdd: (productId, quantity) => ({
    product_id: productId,
    quantity,
  }),

  cartUpdate: (quantity) => ({ quantity }),

  orderCreate: ({ orderNumber, address, items, subtotal, total }) => ({
    order_number: orderNumber,
    subtotal,
    shipping_charge: CHECKOUT_DEFAULTS.shippingCharge,
    tax: CHECKOUT_DEFAULTS.tax,
    total_amount: total,
    payment_status: CHECKOUT_DEFAULTS.initialPaymentStatus,
    order_status: CHECKOUT_DEFAULTS.initialOrderStatus,
    shipping_address: address,
    billing_address: address,
    items: items.map((i) => ({
      product_id: i.productId,
      product_name: i.name,
      sku: i.sku,
      quantity: i.quantity,
      price: i.price,
      total: i.price * i.quantity,
    })),
  }),

  paymentCreate: (orderId, amount) => ({
    order_id: orderId,
    amount,
  }),

  paymentVerify: (orderId, r) => ({
    order_id: orderId,
    razorpay_order_id: r.razorpay_order_id,
    razorpay_payment_id: r.razorpay_payment_id,
    razorpay_signature: r.razorpay_signature,
  }),
};

// Sorting is handled in the browser.
export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

export const PAGE_SIZE = 12;
