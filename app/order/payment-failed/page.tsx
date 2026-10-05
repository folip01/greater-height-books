import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Payment Status" };
export default async function PaymentFailedPage({searchParams}:{searchParams:Promise<{pending?:string}>}) {
  const {pending} = await searchParams;
  return <div className="wrap empty-state"><h1 className="page-title">{pending ? "We’re checking your payment." : "Payment was not completed."}</h1><p className="body-copy">{pending ? "We could not confirm the transaction yet. Please check your order status before trying to pay again." : "Your cart is still available. You can review it and try again when you’re ready."}</p><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:25}}><Link href="/orders" className="button">View Orders</Link>{!pending && <Link href="/checkout" className="button button-secondary">Try Again</Link>}<Link href="/cart" className="button button-quiet">Return to Cart</Link></div></div>;
}
