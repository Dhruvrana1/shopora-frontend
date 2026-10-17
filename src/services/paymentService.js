import { call, ENDPOINTS } from './api';
import { PAYLOADS } from './endpoints';

const SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = SRC;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load the Razorpay payment window. Check your connection.'));
    document.body.appendChild(s);
  });
}

// POST /payments/create returns { message, razorPayOrder: { id, amount, currency, ... } }
export async function createPayment(orderId, amount) {
  const data = await call(ENDPOINTS.payments.create, { body: PAYLOADS.paymentCreate(orderId, amount) });
  if (!data?.razorPayOrder?.id) throw new Error('Payment order was not created.');
  return data.razorPayOrder;
}

/** Opens Razorpay. Resolves with Razorpay's response; rejects if cancelled (err.cancelled) or failed. */
export function openRazorpay(rzpOrder) {
  return new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID; // public key id only
    if (!key) return reject(new Error('VITE_RAZORPAY_KEY_ID is not set in Frontend/.env.'));
    const rzp = new window.Razorpay({
      key,
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      name: 'Shopora',
      handler: resolve,
      modal: {
        ondismiss: () => {
          const e = new Error('cancelled');
          e.cancelled = true;
          reject(e);
        },
      },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed.')));
    rzp.open();
  });
}

// The backend checks the signature. The UI trusts only the order's payment_status loaded afterwards.
export function verifyPayment(orderId, razorpayResponse) {
  return call(ENDPOINTS.payments.verify, { body: PAYLOADS.paymentVerify(orderId, razorpayResponse) });
}
