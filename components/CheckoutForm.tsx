"use client";

import { useState, type FormEvent } from "react";
import { type CartLine } from "@/lib/cart";
import { formatNaira } from "@/lib/currency";
import { type CheckoutDetails } from "@/lib/validation";

export function CheckoutForm({ lines, email, name }: { lines: CartLine[]; email: string; name: string }) {
  const [details, setDetails] = useState<CheckoutDetails>({ fullName: name, email, phone: "", streetAddress: "", city: "", state: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const subtotal = lines.reduce((sum, line) => sum + line.product.price_kobo * line.quantity, 0);
  const field = (key: keyof CheckoutDetails, label: string, type = "text", full = false, autoComplete?: string) =>
    <div className={`field ${full ? "field-full" : ""}`}><label htmlFor={key}>{label}</label><input id={key} name={key} type={type} autoComplete={autoComplete} value={details[key]} required minLength={key === "streetAddress" ? 5 : 2} maxLength={key === "email" ? 254 : key === "streetAddress" ? 250 : 120} onChange={event => setDetails(previous => ({...previous, [key]: event.target.value}))}/></div>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(details) });
      const result = await response.json() as {error?:string; authorizationUrl?:string};
      if (!response.ok || !result.authorizationUrl) throw new Error(result.error ?? "Checkout could not be started.");
      const paymentUrl = new URL(result.authorizationUrl);
      if (paymentUrl.protocol !== "https:" || !(paymentUrl.hostname === "paystack.com" || paymentUrl.hostname.endsWith(".paystack.com"))) throw new Error("Unexpected payment URL. Please try again.");
      window.location.assign(result.authorizationUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Checkout could not be started."); setBusy(false); }
  }

  return <form onSubmit={submit} className="checkout-layout"><div><h2 className="section-title" style={{marginBottom:26}}>Delivery information</h2><div className="form-grid">{field("fullName","Full name","text",true,"name")}{field("email","Email","email",false,"email")}{field("phone","Phone number","tel",false,"tel")}{field("streetAddress","Street address","text",true,"street-address")}{field("city","City","text",false,"address-level2")}{field("state","State","text",false,"address-level1")}</div><p className="body-copy" style={{fontSize:14,marginTop:20}}>These details are saved with your test order. Delivery will be arranged when live ordering begins.</p></div><aside className="summary"><h2>Your order</h2>{lines.map(line => <div className="summary-line" key={line.id}><span>{line.product.subject} 2 · Book {line.product.book_number} × {line.quantity}</span><span>{formatNaira(line.product.price_kobo * line.quantity)}</span></div>)}<div className="summary-line" style={{borderTop:"1px solid #cbd0cd",paddingTop:18}}><span>Books subtotal</span><strong>{formatNaira(subtotal)}</strong></div><div className="summary-line"><span>Delivery fee</span><span>To be confirmed</span></div><div className="summary-line summary-total"><span>Test payment amount: books only</span><span>{formatNaira(subtotal)}</span></div><p className="notice">Checkout is in Paystack test mode. No real money will be collected, and test orders will not be fulfilled. Delivery pricing will be confirmed before live ordering begins.</p>{error && <p className="error" role="alert">{error}</p>}<button type="submit" className="button" disabled={busy || lines.length === 0}>{busy ? "Preparing test payment…" : `Continue to test payment · ${formatNaira(subtotal)}`}</button></aside></form>;
}
