import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/currency";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailsPage({params}:{params:Promise<{reference:string}>}) {
  const {reference} = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) notFound();
  const supabase = await createServerSupabase();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return <div className="wrap empty-state"><h1 className="page-title">Sign in to view your order.</h1><Link href={`/account?next=${encodeURIComponent(`/orders/${reference}`)}`} className="button">Continue with Google</Link></div>;
  const {data:order} = await supabase.from("orders").select("id, order_reference, customer_name, phone, street_address, city, state, subtotal_kobo, delivery_fee_kobo, delivery_status, total_kobo, payment_status, order_status, created_at").eq("order_reference",reference).eq("user_id",user.id).maybeSingle();
  if (!order) notFound();
  const {data:items} = await supabase.from("order_items").select("id, product_name, quantity, unit_price_kobo, subtotal_kobo").eq("order_id",order.id);
  return <div className="wrap"><div className="page-head"><Link href="/orders" className="text-link">← Your orders</Link><h1 className="page-title" style={{marginTop:20}}>Order {order.order_reference}</h1><p className="body-copy">Placed {new Date(order.created_at).toLocaleDateString("en-NG",{year:"numeric",month:"long",day:"numeric"})}</p></div><div className="order-card"><h2 className="section-title" style={{marginBottom:20}}>{order.payment_status === "paid" ? "Test payment confirmed" : order.payment_status === "failed" ? "Test payment not completed" : "Awaiting test payment"}</h2><p className="notice">This is a test order. No real money was collected, and books will not be dispatched.</p>{(items ?? []).map(item => <div className="order-item" key={item.id}><span>{item.product_name}<br/><small>{formatNaira(item.unit_price_kobo)} × {item.quantity}</small></span><strong>{formatNaira(item.subtotal_kobo)}</strong></div>)}<div className="summary-line" style={{marginTop:25}}><span>Books subtotal</span><strong>{formatNaira(order.subtotal_kobo)}</strong></div><div className="summary-line"><span>Delivery fee</span><span>{order.delivery_status === "to_be_confirmed" ? "To be confirmed" : formatNaira(order.delivery_fee_kobo ?? 0)}</span></div><div className="summary-line summary-total"><span>{order.payment_status === "paid" ? "Test amount paid" : "Test order total"}</span><strong>{formatNaira(order.total_kobo)}</strong></div><div style={{marginTop:30}}><strong>Delivery details entered for this test</strong><p className="body-copy" style={{fontSize:15}}>{order.customer_name}<br/>{order.street_address}<br/>{order.city}, {order.state}<br/>{order.phone}</p></div><p className="notice">Delivery pricing and arrangements will be confirmed before live ordering begins.</p></div></div>;
}
