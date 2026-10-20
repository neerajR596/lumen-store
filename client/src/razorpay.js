import { api } from './api.js';

const loadScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = resolve; s.onerror = () => reject(new Error('Could not load Razorpay. Check your internet connection.'));
  document.body.appendChild(s);
});

// Opens Razorpay Checkout for one of our orders. Resolves with the verified order, rejects if cancelled/failed.
export async function payWithRazorpay(orderId, accent = '#0071e3') {
  await loadScript();
  const rz = await api('/payments/razorpay/order', { method: 'POST', body: { orderId } });
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: rz.keyId,
      amount: rz.amount,
      currency: rz.currency,
      name: rz.storeName,
      description: `Order #${String(orderId).slice(-6).toUpperCase()}`,
      order_id: rz.razorpayOrderId,
      prefill: rz.prefill,
      theme: { color: accent },
      handler: async (resp) => {
        try { resolve(await api('/payments/razorpay/verify', { method: 'POST', body: { orderId, ...resp } })); }
        catch (e) { reject(e); }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled. You can retry from your order page.')) },
    });
    checkout.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed')));
    checkout.open();
  });
}
