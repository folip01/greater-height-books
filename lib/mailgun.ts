import { formatNaira } from "@/lib/currency";

type EmailOrder = {
  order_reference: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  total_kobo: number;
  delivery_status: string;
  payment_status: string;
};
type EmailItem = { product_name: string; quantity: number; unit_price_kobo: number };

async function sendEmail(to: string, subject: string, body: string) {
  const key = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;
  if (!key || !domain || !from) throw new Error("Mailgun is not configured yet.");
  const endpoint = process.env.MAILGUN_REGION === "EU" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net";
  const form = new FormData();
  form.set("from", from); form.set("to", to); form.set("subject", subject); form.set("text", body);
  const response = await fetch(`${endpoint}/v3/${encodeURIComponent(domain)}/messages`, {
    method: "POST", headers: { Authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}` }, body: form,
  });
  if (!response.ok) throw new Error(`Mailgun returned ${response.status}`);
}

function itemLines(items: EmailItem[]) {
  return items.map(item => `${item.product_name}\n${formatNaira(item.unit_price_kobo)} × ${item.quantity}`).join("\n\n");
}

export async function sendCustomerConfirmation(order: EmailOrder, items: EmailItem[]) {
  await sendEmail(order.customer_email, "Your Greater Height Books Order Has Been Confirmed", `Hi ${order.customer_name},\n\nThank you for ordering from Greater Height Books.\n\nOrder: ${order.order_reference}\n\n${itemLines(items)}\n\nAmount paid for books: ${formatNaira(order.total_kobo)}\nDelivery fee: To be confirmed separately\n\nDelivery address:\n${order.street_address}, ${order.city}, ${order.state}\n\nYour payment has been verified and your order has been received. We will contact you regarding delivery arrangements and any applicable charge.\n\nThank you for choosing Greater Height Books.`);
}

export async function sendSellerNotification(order: EmailOrder, items: EmailItem[]) {
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!to) return false;
  await sendEmail(to, `New paid order ${order.order_reference}`, `Order: ${order.order_reference}\nPayment: ${order.payment_status}\nCustomer: ${order.customer_name}\nPhone: ${order.phone}\nEmail: ${order.customer_email}\nAddress: ${order.street_address}, ${order.city}, ${order.state}\n\n${itemLines(items)}\n\nBooks paid: ${formatNaira(order.total_kobo)}\nDelivery: To be confirmed separately`);
  return true;
}
