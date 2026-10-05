"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { addProductToCart } from "@/lib/cart-client";
import { savePendingCart } from "@/lib/pending-cart";

export function AddToCartButton({ productId, productSlug, compact = false, disabled = false }: { productId?: string; productSlug?: string; compact?: boolean; disabled?: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function add() {
    if (!productId) { setMessage("Ordering will be available when the store database is connected."); return; }
    setBusy(true); setMessage("");
    try {
      const supabase = createBrowserSupabase();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user && (!authError || authError.name === "AuthSessionMissingError")) {
        const returnPath = productSlug ? `/books/${productSlug}` : window.location.pathname;
        if (productSlug) savePendingCart(productId, productSlug, quantity);
        router.push(`/account?intent=cart&next=${encodeURIComponent(returnPath)}`);
        return;
      }
      if (authError || !user) throw new Error("Could not check your sign-in. Please try again.");
      await addProductToCart(supabase, user.id, productId, quantity);
      setMessage("Added to cart."); router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setMessage(["This book is currently unavailable.", "The requested quantity exceeds current stock.", "Could not check your sign-in. Please try again."].includes(message) ? message : "Could not add this book right now. Please try again.");
    }
    finally { setBusy(false); }
  }

  return <div>{!compact && <div><label className="quantity-label" htmlFor={`qty-${productId ?? "preview"}`}>Quantity</label><input id={`qty-${productId ?? "preview"}`} className="quantity-input" type="number" min="1" max="99" value={quantity} onChange={event => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}/></div>}<button type="button" className={`button ${compact ? "button-secondary" : ""}`} style={compact ? {} : {marginTop:18}} disabled={disabled || busy} onClick={add}>{disabled ? "Out of stock" : busy ? "Adding…" : "Add to Cart"}</button>{message && <p className={message === "Added to cart." ? "success" : "error"} role="status" style={{marginTop:10}}>{message}</p>}</div>;
}
