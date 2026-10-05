import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { SignOutButton } from "@/components/SignOutButton";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{next?:string;error?:string;intent?:string}> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/account";
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let user: { email?: string; name?: string } | null = null;
  if (configured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    if (data.user) user = { email: data.user.email, name: data.user.user_metadata?.full_name };
  }
  if (user && params.intent === "cart") redirect(`/auth/complete?next=${encodeURIComponent(next)}`);
  return <div className="wrap"><div className="page-head"><h1 className="page-title">Your Account</h1><p className="body-copy">{params.intent === "cart" ? "Sign in to add this book to your cart. We’ll open your cart when it’s ready." : "Sign in to save your cart and see your orders."}</p></div>{params.error && <p className="error" role="alert">Google sign-in could not be completed. Please try again.</p>}{user ? <div className="order-card"><h2 className="section-title">Welcome{user.name ? `, ${user.name}` : ""}</h2><p className="body-copy">{user.email}</p><div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:25}}>{params.intent === "cart" && <Link href={next} className="button">Return to book</Link>}<Link href="/orders" className="button button-secondary">View Orders</Link><SignOutButton/></div></div> : configured ? <div className="order-card"><h2 style={{fontSize:23,fontWeight:700,marginBottom:16}}>Continue with Google</h2><p className="body-copy" style={{marginBottom:22}}>A Google account keeps your cart and order history in one place.</p><GoogleSignInButton next={next}/></div> : <div className="notice">Sign-in will be available when Supabase and Google are connected.</div>}</div>;
}
