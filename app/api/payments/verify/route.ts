import { NextResponse, type NextRequest } from "next/server";
import { processPayment } from "@/lib/order-processing";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  if (!reference || !/^[A-Z0-9-]{10,80}$/.test(reference)) return NextResponse.redirect(new URL("/order/payment-failed", base));
  try {
    const result = await processPayment(reference);
    const path = result.success ? `/order/success?reference=${encodeURIComponent(result.orderReference)}` : result.pending ? "/order/payment-failed?pending=1" : "/order/payment-failed";
    return NextResponse.redirect(new URL(path, base));
  } catch (error) {
    console.error("Payment verification deferred", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.redirect(new URL(`/order/payment-failed?reference=${encodeURIComponent(reference)}&pending=1`, base));
  }
}
