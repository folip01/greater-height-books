import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processPayment } from "@/lib/order-processing";
import { paystackTestSecret } from "@/lib/paystack";

export async function POST(request: Request) {
  let secret: string;
  try { secret = paystackTestSecret(); }
  catch { return NextResponse.json({ error: "Unavailable" }, { status: 503 }); }
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const supplied = /^[0-9a-f]{128}$/i.test(signature) ? Buffer.from(signature, "hex") : Buffer.alloc(0);
  const valid = supplied.length === 64 && timingSafeEqual(supplied, Buffer.from(expected, "hex"));
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let event: {event?:string; data?:{reference?:string}};
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid payload" }, { status: 400 }); }
  if (event.event !== "charge.success" || !event.data?.reference) return NextResponse.json({ received: true });
  try {
    await processPayment(event.data.reference);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Retry later" }, { status: 500 });
  }
}
