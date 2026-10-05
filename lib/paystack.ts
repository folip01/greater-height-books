type PaystackEnvelope<T> = { status: boolean; message: string; data: T };
type PaystackInit = { authorization_url: string; access_code: string; reference: string };
export type VerifiedTransaction = { reference: string; status: string; amount: number; currency: string; paid_at?: string };

export function paystackTestSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key?.startsWith("sk_test_")) throw new Error("Paystack test mode is not configured yet.");
  return key;
}

export async function initializePayment(input: { email: string; amount: number; reference: string; orderId: string }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("Site URL is not configured yet.");
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${paystackTestSecret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: input.email, amount: input.amount, currency: "NGN", reference: input.reference, callback_url: `${base}/api/payments/verify`, metadata: { order_id: input.orderId } }),
    cache: "no-store",
  });
  const result = await response.json() as PaystackEnvelope<PaystackInit>;
  if (!response.ok || !result.status || !result.data?.authorization_url) throw new Error("Unable to start payment right now.");
  return result.data.authorization_url;
}

export async function verifyPayment(reference: string): Promise<VerifiedTransaction> {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackTestSecret()}` }, cache: "no-store",
  });
  const result = await response.json() as PaystackEnvelope<VerifiedTransaction>;
  if (!response.ok || !result.status || !result.data) throw new Error("Payment could not be verified yet.");
  return result.data;
}
