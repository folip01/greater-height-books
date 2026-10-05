"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCover } from "@/components/BookCover";
import { type CartLine } from "@/lib/cart";
import { formatNaira } from "@/lib/currency";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function CartContents({ initialLines, userId }: { initialLines: CartLine[]; userId: string }) {
  const [lines, setLines] = useState(initialLines);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const subtotal = lines.reduce((sum, line) => sum + line.product.price_kobo * line.quantity, 0);
  const unavailable = lines.some(line => !line.product.is_active || line.product.stock_quantity === 0 || (line.product.stock_quantity !== null && line.quantity > line.product.stock_quantity));

  useEffect(() => {
    const supabase = createBrowserSupabase();
    let active = true;
    let newestRequest = 0;

    async function reloadCart() {
      const request = ++newestRequest;
      const { data, error } = await supabase.from("cart_items")
        .select("id, product_id, quantity, product:products(slug, name, subject, book_number, image_url, price_kobo, stock_quantity, is_active)")
        .eq("user_id", userId).order("created_at");
      if (active && request === newestRequest && !error) setLines((data ?? []) as unknown as CartLine[]);
    }

    // RLS limits INSERT and UPDATE events to this customer's rows. DELETE
    // events do not apply RLS, so removals are refreshed on focus instead.
    const channel = supabase.channel(`cart-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` }, () => { void reloadCart(); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` }, () => { void reloadCart(); })
      .subscribe(status => { if (status === "SUBSCRIBED") void reloadCart(); });

    const refreshOnFocus = () => { void reloadCart(); };
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void reloadCart(); };
    // Keep the visible cart current when the Realtime socket is interrupted.
    // This also covers DELETE, whose row data is unavailable under RLS.
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") void reloadCart();
    }, 1500);
    void reloadCart();
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  async function change(line: CartLine, quantity: number) {
    if (busyId) return;
    setBusyId(line.id); setError("");
    try {
      const supabase = createBrowserSupabase();
      if (quantity === 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", line.id);
        if (error) throw error;
        setLines(previous => previous.filter(item => item.id !== line.id));
      } else {
        if (line.product.stock_quantity !== null && quantity > line.product.stock_quantity) throw new Error("That quantity exceeds current stock.");
        const { error } = await supabase.from("cart_items").update({quantity}).eq("id", line.id);
        if (error) throw error;
        setLines(previous => previous.map(item => item.id === line.id ? {...item, quantity} : item));
      }
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your cart."); }
    finally { setBusyId(""); }
  }

  if (!lines.length) return <div className="empty-state"><h2 className="section-title">Your cart is empty.</h2><p className="body-copy">Find the books you need in our collection.</p><Link href="/shop" className="button">Shop Books</Link></div>;
  return <div className="cart-layout"><div>{error && <p className="error" role="alert">{error}</p>}{lines.map(line => <div className="cart-row" key={line.id}><Link href={`/books/${line.product.slug}`}><BookCover book={{...line.product, subject: line.product.subject as "English"|"Mathematics", author:"F.O. Bamidele", description:"", is_active:line.product.is_active}}/></Link><div><h2><Link href={`/books/${line.product.slug}`}>{line.product.name}</Link></h2><small>{line.product.subject} 2 · Book {line.product.book_number}</small>{(!line.product.is_active || line.product.stock_quantity === 0) && <p className="error">Currently unavailable</p>}<div><button className="remove" type="button" disabled={!!busyId} onClick={() => change(line,0)}>Remove</button></div></div><div><label className="quantity-label" htmlFor={`cart-${line.id}`}>Qty</label><input id={`cart-${line.id}`} type="number" min="1" max="99" value={line.quantity} disabled={!!busyId} onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1 && value <= 99) change(line,value); }}/></div><div className="row-total"><strong>{formatNaira(line.quantity * line.product.price_kobo)}</strong><div><small>{formatNaira(line.product.price_kobo)} each</small></div></div></div>)}</div><aside className="summary"><h2>Order summary</h2><div className="summary-line"><span>Books subtotal</span><strong>{formatNaira(subtotal)}</strong></div><div className="summary-line"><span>Delivery fee</span><span>To be confirmed</span></div><div className="summary-line summary-total"><span>Pay now</span><span>{formatNaira(subtotal)}</span></div><p className="notice">You are paying for books only. Delivery arrangements and any charge will be confirmed separately.</p>{unavailable ? <p className="error" role="alert">Remove unavailable books or reduce their quantity before checkout.</p> : <Link href="/checkout" className="button">Continue to Checkout</Link>}<Link href="/shop" className="text-link" style={{display:"block",textAlign:"center",marginTop:20}}>Continue shopping</Link></aside></div>;
}
