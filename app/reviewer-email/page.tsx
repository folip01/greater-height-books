import { timingSafeEqual } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Receipt email setup" };

type Status = "sent" | "ready" | "pending" | "full" | "invalid" | "unavailable";

const messages: Record<Status, string> = {
  sent: "Mailgun has sent a verification invitation. Open it in this email account and confirm the address before placing your order.",
  ready: "This email address is already verified for receipt delivery. You can continue to the shop.",
  pending: "A verification invitation is already pending for this address. Check your inbox and spam folder, then confirm it before ordering.",
  full: "All sandbox recipient slots are in use. Please contact Greater Height Books before placing a test order.",
  invalid: "The access code is incorrect. Please check the code supplied with your review instructions.",
  unavailable: "Email setup is temporarily unavailable. Please try again later.",
};

function hasValidCode(value: FormDataEntryValue | null) {
  const expected = process.env.REVIEWER_INVITE_CODE;
  if (typeof value !== "string" || !expected || value.length > 128) return false;
  const submitted = Buffer.from(value.trim());
  const actual = Buffer.from(expected);
  return submitted.length === actual.length && timingSafeEqual(submitted, actual);
}

async function requestInvitation(formData: FormData) {
  "use server";
  if (!hasValidCode(formData.get("code"))) redirect("/reviewer-email?status=invalid");

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  const google = user?.app_metadata?.providers?.includes("google") || user?.app_metadata?.provider === "google";
  if (error || !user?.email || !user.email_confirmed_at || !google) {
    redirect("/account?next=%2Freviewer-email");
  }
  const email = user.email;

  const key = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  if (!key || !domain?.startsWith("sandbox") || !domain.endsWith(".mailgun.org")) {
    redirect("/reviewer-email?status=unavailable");
  }

  const endpoint = process.env.MAILGUN_REGION === "EU" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net";
  const authorization = `Basic ${Buffer.from(`api:${key}`).toString("base64")}`;
  let outcome: Status = "unavailable";
  try {
    const list = await fetch(`${endpoint}/v5/sandbox/auth_recipients`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    if (list.ok) {
      const payload = await list.json() as { limit?: number; recipients?: { email: string; activated: boolean }[] };
      const recipients = payload.recipients ?? [];
      const existing = recipients.find(recipient => recipient.email.toLowerCase() === email.toLowerCase());
      if (existing) outcome = existing.activated ? "ready" : "pending";
      else if (recipients.length >= (payload.limit ?? 5)) outcome = "full";
      else {
        const invite = await fetch(`${endpoint}/v5/sandbox/auth_recipients?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { Authorization: authorization },
          cache: "no-store",
        });
        outcome = invite.ok ? "sent" : "unavailable";
      }
    }
  } catch {
    outcome = "unavailable";
  }
  redirect(`/reviewer-email?status=${outcome}`);
}

export default async function ReviewerEmailPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  const message = status && status in messages ? messages[status as Status] : null;

  return <div className="wrap" style={{ maxWidth: 700 }}>
    <div className="page-head">
      <h1 className="page-title">Receipt email setup</h1>
      <p className="body-copy">The current Mailgun sandbox sends receipts only to addresses that accept its verification invitation.</p>
    </div>
    {!email ? <div className="empty-state">
      <p className="body-copy">Sign in with the Google account you will use for your test order.</p>
      <Link className="button" href="/account?next=%2Freviewer-email">Continue with Google</Link>
    </div> : <div>
      <p className="body-copy" style={{ marginBottom: 20 }}>Signed in as <strong>{email}</strong>. Your invitation can only be sent to this address.</p>
      {message && <p className={status === "invalid" || status === "full" || status === "unavailable" ? "error" : "notice"} role="status" style={{ marginBottom: 20 }}>{message}</p>}
      <form action={requestInvitation} style={{ maxWidth: 420 }}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="reviewer-code">Review access code</label>
          <input id="reviewer-code" name="code" type="password" required autoComplete="off" />
        </div>
        <button type="submit" className="button">Request email verification</button>
      </form>
      <p className="body-copy" style={{ marginTop: 24 }}>After confirming the invitation, use this same email address at checkout. The store will email your receipt after a verified Paystack test payment.</p>
      <Link href="/shop" className="text-link">Return to shop</Link>
    </div>}
  </div>;
}
