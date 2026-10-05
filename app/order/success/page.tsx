import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/currency";

export const metadata: Metadata = { title: "Payment Confirmed" };

export default async function SuccessPage({searchParams}:{searchParams:Promise<{reference?:string}>}) {
  const {reference} = await searchParams;
  if (!reference || !process.env.NEXT_PUBLIC_SUPABASE_URL) return <div className="wrap empty-state"><h1 className="page-title">Order unavailable</h1><Link className="button" href="/orders">View your orders</Link></div>;
  const supabase = await createServerSupabase();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return <div className="wrap empty-state"><h1 className="page-title">Sign in to view your order.</h1><Link className="button" href={`/account?next=${encodeURIComponent(`/order/success?reference=${reference}`)}`}>Continue with Google</Link></div>;
  const {data:order} = await supabase.from("orders").select("order_reference, total_kobo, payment_status").eq("order_reference",reference).eq("user_id",user.id).maybeSingle();
  if (!order || order.payment_status !== "paid") return <div className="wrap empty-state"><h1 className="page-title">Payment is still being checked.</h1><p className="body-copy">Please view your order for its latest status. Your cart remains available until payment is verified.</p><Link className="button" href="/orders">View your orders</Link></div>;
  return <div className="wrap empty-state"><div className="eyebrow">Test order confirmed</div><h1 className="page-title">Test payment successful.</h1><p className="body-copy">Paystack verified this test transaction. No real money was collected, and this order will not be fulfilled.</p><p className="body-copy"><strong>Order:</strong> {order.order_reference}<br/><strong>Test amount:</strong> {formatNaira(order.total_kobo)}</p><div style={{display:"flex",gap:12,marginTop:25,flexWrap:"wrap"}}><Link className="button" href={`/orders/${order.order_reference}`}>View Order</Link><Link className="button button-secondary" href="/shop">Continue Shopping</Link></div></div>;
}
