const storageKey = "greater-height-pending-cart";
const maxAgeMs = 15 * 60 * 1000;

type PendingCart = { productId: string; productSlug: string; quantity: number; createdAt: number };

export function savePendingCart(productId: string, productSlug: string, quantity: number) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({ productId, productSlug, quantity, createdAt: Date.now() }));
  } catch {
    // Sign-in still works if browser storage is unavailable; the customer can add the book afterward.
  }
}

export function takePendingCart(next: string): PendingCart | null {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const pending: PendingCart = JSON.parse(raw);
    if (!/^[a-f\d-]{36}$/i.test(pending.productId) ||
      !/^[a-z0-9-]+$/.test(pending.productSlug) ||
      next !== `/books/${pending.productSlug}` ||
      !Number.isInteger(pending.quantity) || pending.quantity < 1 || pending.quantity > 99 ||
      !Number.isFinite(pending.createdAt) || Date.now() - pending.createdAt > maxAgeMs) return null;
    return pending;
  } catch {
    return null;
  }
}
