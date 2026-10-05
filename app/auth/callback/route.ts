import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextValue = searchParams.get("next") ?? "/account";
  const next = nextValue.startsWith("/") && !nextValue.startsWith("//") ? nextValue : "/account";
  if (!code) return NextResponse.redirect(`${origin}/account?error=auth`);
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/account?error=auth`);
  await supabase.from("profiles").upsert({ id: data.user.id, email: data.user.email, full_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null, avatar_url: data.user.user_metadata?.avatar_url ?? null }, { onConflict: "id" });
  const complete = new URL("/auth/complete", origin);
  complete.searchParams.set("next", next);
  return NextResponse.redirect(complete, 303);
}
