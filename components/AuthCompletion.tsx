"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addProductToCart } from "@/lib/cart-client";
import { takePendingCart } from "@/lib/pending-cart";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function AuthCompletion({ next }: { next: string }) {
  const started = useRef(false);
  const [message, setMessage] = useState("Confirming your sign-in…");
  const [failed, setFailed] = useState(false);
  const [recovery, setRecovery] = useState({ href: `/account?next=${encodeURIComponent(next)}`, label: "Try Google sign-in again" });

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function complete() {
      try {
        const supabase = createBrowserSupabase();
        let user = null;
        for (let attempt = 0; attempt < 4; attempt++) {
          const result = await supabase.auth.getUser();
          if (result.data.user) { user = result.data.user; break; }
          if (result.error && result.error.name !== "AuthSessionMissingError") break;
          await new Promise(resolve => setTimeout(resolve, 350));
        }
        if (!user) throw new Error("sign-in incomplete");

        const pending = takePendingCart(next);
        if (pending) {
          setMessage("Adding your book to the cart…");
          try {
            await addProductToCart(supabase, user.id, pending.productId, pending.quantity);
          } catch {
            setMessage("You are signed in, but we could not add the book. Please try again from its page.");
            setRecovery({ href: next, label: "Return to book" });
            setFailed(true);
            return;
          }
          window.location.replace("/cart");
        } else {
          window.location.replace(next);
        }
      } catch {
        setMessage("Sign-in could not be completed. Please try again.");
        setFailed(true);
      }
    }

    void complete();
  }, [next]);

  return <div className="wrap"><div className="page-head"><h1 className="page-title">Finishing sign-in</h1><p className={failed ? "error" : "body-copy"} role="status">{message}</p>{failed && <Link className="button" href={recovery.href}>{recovery.label}</Link>}</div></div>;
}
