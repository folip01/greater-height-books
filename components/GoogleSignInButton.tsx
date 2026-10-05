"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function GoogleSignInButton({ next = "/account" }: { next?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signIn() {
    setBusy(true); setError("");
    try {
      const supabase = createBrowserSupabase();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next.startsWith("/") && !next.startsWith("//") ? next : "/account");
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback.toString() } });
      if (error) throw error;
    } catch { setError("Google sign-in is not available yet. Please try again later."); setBusy(false); }
  }
  return <div><button className="button" type="button" disabled={busy} onClick={signIn}>{busy ? "Connecting…" : "Continue with Google"}</button>{error && <p className="error" role="alert">{error}</p>}</div>;
}
