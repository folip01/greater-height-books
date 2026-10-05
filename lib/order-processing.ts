import { createAdminSupabase } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/paystack";
import { sendCustomerConfirmation, sendSellerNotification } from "@/lib/mailgun";

async function notifyOnce(orderId: string, kind: "customer" | "seller") {
  if (process.env.MAILGUN_ENABLED !== "true") return;
  const admin = createAdminSupabase();
  const statusField = kind === "customer" ? "customer_email_status" : "seller_email_status";
  const sentField = kind === "customer" ? "customer_email_sent_at" : "seller_email_sent_at";
  const { data: claimed, error: claimError } = await admin.from("orders")
    .update({ [statusField]: "sending" }).eq("id", orderId).in(statusField, ["pending", "failed"])
    .select("id, order_reference, customer_name, customer_email, phone, street_address, city, state, total_kobo, delivery_status, payment_status").maybeSingle();
  if (claimError || !claimed) return;
  const { data: items, error: itemError } = await admin.from("order_items")
    .select("product_name, quantity, unit_price_kobo").eq("order_id", orderId);
  try {
    if (itemError) throw itemError;
    if (kind === "customer") await sendCustomerConfirmation(claimed, items ?? []);
    else if (!(await sendSellerNotification(claimed, items ?? []))) {
      await admin.from("orders").update({ [statusField]: "pending" }).eq("id", orderId);
      return;
    }
    await admin.from("orders").update({ [statusField]: "sent", [sentField]: new Date().toISOString() }).eq("id", orderId);
  } catch (error) {
    await admin.from("orders").update({ [statusField]: "failed" }).eq("id", orderId);
    console.error("Order notification failed", { orderId, kind, reason: error instanceof Error ? error.message : "Unknown error" });
  }
}

export async function processPayment(reference: string): Promise<{ orderReference: string; success: boolean; pending: boolean }> {
  const admin = createAdminSupabase();
  const { data: order, error } = await admin.from("orders")
    .select("id, order_reference, total_kobo, currency, payment_status")
    .eq("payment_reference", reference).maybeSingle();
  if (error || !order) throw new Error("Order not found.");
  if (order.payment_status !== "paid") {
    const payment = await verifyPayment(reference);
    if (payment.reference !== reference || payment.amount !== order.total_kobo || payment.currency !== order.currency) throw new Error("Paystack payment details do not match the order.");
    if (payment.status !== "success") {
      if (payment.status === "failed") {
        const { error: stateError } = await admin.from("orders").update({ payment_status: "failed" }).eq("id", order.id).eq("payment_status", "pending");
        if (stateError) throw new Error("Could not record the payment status yet.");
      }
      return {
        orderReference: order.order_reference,
        success: false,
        pending: !["failed", "abandoned", "reversed"].includes(payment.status),
      };
    }
    const { error: finalizeError } = await admin.rpc("finalize_paid_order", { p_payment_reference: reference, p_amount_kobo: payment.amount, p_currency: payment.currency });
    if (finalizeError) throw new Error("Payment was received but order confirmation is still processing.");
  }
  await notifyOnce(order.id, "customer");
  await notifyOnce(order.id, "seller");
  return { orderReference: order.order_reference, success: true, pending: false };
}
