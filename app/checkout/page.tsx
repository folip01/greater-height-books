import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getCart } from "@/lib/cart";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  let user: {email:string; name:string} | null = null;
  if (configured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    if (data.user) user = { email: data.user.email ?? "", name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? "" };
  }
  const lines = user ? await getCart() : [];
  return <div className="wrap"><div className="page-head"><h1 className="page-title">Checkout</h1><p className="body-copy">Review your books and complete a Paystack test payment.</p></div>{!configured ? <div className="notice">Checkout will be available when the store services are connected.</div> : !user ? <div className="empty-state"><p className="body-copy">Sign in with Google to complete your test order.</p><Link href="/account?next=%2Fcheckout" className="button">Continue with Google</Link></div> : !lines.length ? <div className="empty-state"><p className="body-copy">Your cart is empty.</p><Link href="/shop" className="button">Shop Books</Link></div> : <CheckoutForm lines={lines} email={user.email} name={user.name}/>}</div>;
}
