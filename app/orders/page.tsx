import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/currency";

export const metadata: Metadata = { title: "Your Orders" };

export default async function OrdersPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <div className="wrap empty-state"><h1 className="page-title">Your Orders</h1><p className="body-copy">Order history will be available after setup.</p></div>;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="wrap empty-state"><h1 className="page-title">Your Orders</h1><p className="body-copy">Sign in to see your orders.</p><Link href="/account?next=%2Forders" className="button">Continue with Google</Link></div>;
  const { data, error } = await supabase.from("orders").select("order_reference, created_at, total_kobo, payment_status").eq("user_id",user.id).order("created_at",{ascending:false});
  if (error) return <div className="wrap empty-state"><h1 className="page-title">Your Orders</h1><p className="error">Your orders could not be loaded right now.</p></div>;
  return <div className="wrap"><div className="page-head"><h1 className="page-title">Your Orders</h1><p className="body-copy">Test orders are for checking the store. No real money is collected or books dispatched.</p></div>{!data?.length ? <div className="empty-state"><p className="body-copy">No orders yet.</p><Link href="/shop" className="button">Shop Books</Link></div> : <div className="order-card">{data.map(order => <div className="order-item" key={order.order_reference}><div><Link href={`/orders/${order.order_reference}`} className="text-link">{order.order_reference}</Link><div style={{color:"var(--muted)",fontSize:13,marginTop:6}}>{new Date(order.created_at).toLocaleDateString("en-NG",{year:"numeric",month:"long",day:"numeric"})} · {order.payment_status === "paid" ? "Test payment confirmed" : order.payment_status === "failed" ? "Test payment not completed" : "Awaiting test payment"}</div></div><strong>{formatNaira(order.total_kobo)}</strong></div>)}</div>}</div>;
}
