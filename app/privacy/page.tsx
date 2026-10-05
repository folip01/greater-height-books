import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="wrap" style={{ maxWidth: 760 }}>
      <div className="page-head"><h1 className="page-title">Privacy</h1></div>
      <p className="body-copy">Greater Height Books uses your Google account name and email to provide sign-in. We use the contact and delivery details you enter to record your book order and arrange delivery.</p>
      <p className="body-copy">Account, cart and order information is stored in Supabase. Test payments are handled by Paystack; Greater Height Books does not store your card details. Test payments do not collect real money or place an order for fulfilment.</p>
      <p className="body-copy">Order confirmation emails are currently sent through Mailgun only to addresses verified for its sandbox. For privacy questions, contact <a className="text-link" href="mailto:folijr01@gmail.com">folijr01@gmail.com</a>.</p>
    </main>
  );
}
