import type { Metadata } from "next";
import Link from "next/link";
import { CartContents } from "@/components/CartContents";
import { getCart } from "@/lib/cart";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  let userId: string | null = null;
  if (configured) {
    const supabase = await createServerSupabase();
    userId = (await supabase.auth.getUser()).data.user?.id ?? null;
  }
  return <div className="wrap"><div className="page-head"><h1 className="page-title">Your Cart</h1><p className="body-copy">Review your books before checkout.</p></div>{!configured ? <div className="notice">The cart will be available when the store database is connected.</div> : !userId ? <div className="empty-state"><p className="body-copy">Sign in with Google to keep your cart and complete checkout.</p><Link href="/account?next=%2Fcart" className="button">Sign in</Link></div> : <CartContents initialLines={await getCart()} userId={userId}/>}</div>;
}
