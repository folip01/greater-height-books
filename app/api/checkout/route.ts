import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { initializePayment } from "@/lib/paystack";
import { validateCheckout } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });
    const details = validateCheckout(await request.json());
    const admin = createAdminSupabase();
    const date = new Date().toISOString().slice(0,10).replaceAll("-", "");
    const reference = `GH-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const paymentReference = `${reference}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const { data, error } = await admin.rpc("create_pending_order", {
      p_user_id: user.id, p_reference: reference, p_payment_reference: paymentReference,
      p_name: details.fullName, p_email: details.email, p_phone: details.phone,
      p_street: details.streetAddress, p_city: details.city, p_state: details.state,
    });
    if (error || !data?.[0]) {
      const message = error?.message.includes("EMPTY_CART") ? "Your cart is empty." : error?.message.includes("CART_ITEM_UNAVAILABLE") ? "A book in your cart is no longer available in the requested quantity." : "Could not create your order. Please review your cart and try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const order = data[0] as {order_id:string; amount_kobo:number};
    try {
      const authorizationUrl = await initializePayment({ email: details.email, amount: order.amount_kobo, reference: paymentReference, orderId: order.order_id });
      return NextResponse.json({ authorizationUrl, orderReference: reference });
    } catch {
      // The provider may have accepted initialization even if its response was lost.
      // Keep the order pending so a later signed webhook can still settle it.
      return NextResponse.json({ error: "Payment could not be started. Your cart is still available." }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });
    if (error instanceof Error && [
      "Please complete the checkout form.",
      "Please check your delivery details.",
      "Enter your full name.",
      "Enter a valid email address.",
      "Enter a valid phone number.",
      "Enter your full delivery address.",
    ].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Checkout failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Checkout is temporarily unavailable." }, { status: 503 });
  }
}
