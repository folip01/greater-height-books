# Greater Height Books

A real educational bookstore for six Greater Height English and Mathematics books by F.O. Bamidele. Built with Next.js, TypeScript, Tailwind CSS, Supabase, Google OAuth, Paystack, and Mailgun.

The shop, checkout, Supabase persistence, Google authentication, and Mailgun confirmation flow implement the five HNG Lesson 2 individual task requirements. A Paystack test payment triggered a Mailgun confirmation that arrived at an authorized sandbox recipient. Mailgun's sandbox limits delivery to approved addresses until the business verifies a domain it controls.

## Current setup state

The store is deployed on Netlify Free. The FOBE BOOKS Supabase project has all five store tables secured with Row Level Security, and the six books are seeded. Google OAuth was created in Google Cloud Console, enabled in Supabase, and tested on the deployed store. The Google app is now set to **In production** for public sign-in, with the deployed callback allowed in Supabase. A signed-in cart item persisted through a page refresh on the deployed store. A Paystack test payment of ₦17,500 for four book titles succeeded on October 1, 2026. The server verified the payment, marked order `GH-20261001-C71566FC` paid, and cleared the cart. Supabase recorded `customer_email_status=sent`, and the owner confirmed receipt of the Mailgun email. The Paystack Test Webhook URL is configured; delivery of a new webhook event still needs verification. All payment processing remains in **Paystack test mode**; test payments do not collect real money or trigger order fulfilment.

## Lesson 3 Android app

The signed Android APK is served at `/downloads/greater-height-books-android.apk`. Its source is in `android/`. The APK wraps the existing `/mobile` PWA as a Trusted Web Activity. The website and Android app use the same deployed origin, Supabase Google account, and Supabase cart API. The domain association is in `public/.well-known/assetlinks.json`.

The cart subscribes to Supabase Realtime for the signed-in user's inserted and updated cart rows. It fetches the latest database cart after each event. Returning to the app reloads the cart, including removals made while it was in the background. The service worker provides an offline explanation page but does not cache account, cart, checkout, or payment responses.

For the required physical-phone video, install the **APK** on Android and follow `docs/LESSON3_DEMO.md`. The owner previously confirmed website-to-installed-PWA cart sync on a physical phone. The separately packaged APK still needs its own install, login, and two-way cart test.

The APK was generated and signed by PWABuilder from the deployed web manifest. Its signing keystore and password file are retained locally under ignored `work/android-signing/`; never commit or publish them. `android/` contains the generated Gradle project without signing credentials or build outputs. Future APK updates must use the same signing key and increment the Android version code. The APK and website remain dependent on the deployed HTTPS store; a browser with Trusted Web Activity support is required on the phone.

## Local setup

1. Install Node.js 20.9 or newer.
2. Run `npm install` and `npm run dev`.
3. Open `http://localhost:3000`.
4. Copy `.env.example` to `.env.local` and set the values below. Never commit `.env.local`.

### Environment variables

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Connect dialog |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Project Settings → API Keys, publishable key |
| `SUPABASE_SECRET_KEY` | Supabase Project Settings → API Keys, secret key; server only |
| `PAYSTACK_SECRET_KEY` | Paystack Dashboard → Settings → API Keys & Webhooks → Test Secret Key (`sk_test_…`) |
| `MAILGUN_ENABLED` | `true` after configuring an active Mailgun account; `false` pauses sending |
| `MAILGUN_API_KEY` | Mailgun private API key; keep it server-side. The reviewer invite flow needs the account key, not a domain-only sending key |
| `MAILGUN_DOMAIN` | Mailgun sending domain, including the sandbox domain during testing |
| `MAILGUN_FROM_EMAIL` | Sender address on that Mailgun domain |
| `MAILGUN_REGION` | `US` or `EU`, matching your Mailgun domain region |
| `ORDER_NOTIFICATION_EMAIL` | Optional seller notification address |
| `REVIEWER_INVITE_CODE` | Private code shared only in HNG submission instructions to let a signed-in reviewer authorize their own email in the Mailgun sandbox |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; your Netlify site URL when deployed |

The Google Client ID and Client Secret are entered in Supabase's Google provider settings, not in this app's environment file. Paystack's public key is unnecessary because this app uses Paystack's hosted authorization URL.

## Supabase database

1. Create a free Supabase project. The connected FOBE BOOKS project is already set up.
2. For a different project, run `supabase/migrations/202609300001_initial_store.sql` in SQL Editor.
3. Run `supabase/seed.sql` once to add the six books. It is safe to rerun; existing products are not overwritten.
   If the initial seed was applied before the front-cover images were created, apply `supabase/migrations/202610010001_front_cover_images.sql` to update the six image paths.
4. Confirm Row Level Security is enabled on all five store tables. The migration creates the policies.
5. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.

The Supabase secret key bypasses Row Level Security. It is used only by server routes for trusted order and payment operations.

The six source spreads remain in `public/books/originals`. The storefront uses exact front-cover crops in `public/books`; run `npm run crop:covers` to regenerate them from the originals.

## Google sign-in

1. Open Google Cloud Console → Google Auth Platform. Create or choose a project and set up the consent screen for the bookstore.
2. Create a **Web application** OAuth client.
3. Add `http://localhost:3000` and your deployed site origin under authorized JavaScript origins.
4. In Supabase → Authentication → Providers → Google, copy the Supabase callback URL. Add that exact URL to the Google OAuth client's authorized redirect URIs.
5. Copy the Google Client ID and Client Secret into Supabase's Google provider settings and enable Google.
6. In Supabase → Authentication → URL Configuration, set the site URL and allow `http://localhost:3000/auth/callback` and your deployed `/auth/callback` URL.
7. If the Google app is in testing mode, add the Google accounts that will test sign-in.

The app exchanges the OAuth code at `/auth/callback` and keeps the user signed in through Supabase Auth cookies.

## Paystack test flow

1. Create a free Paystack account and switch the dashboard to **Test Mode**.
2. Find `sk_test_…` in Settings → API Keys & Webhooks and set `PAYSTACK_SECRET_KEY`.
3. After deployment, set the test webhook URL to `https://YOUR-SITE.netlify.app/api/payments/webhook`.
4. Set `NEXT_PUBLIC_SITE_URL` to the exact deployed HTTPS origin. The app provides Paystack with `/api/payments/verify` as the callback URL.
5. Place an order with Paystack's documented test payment method. Confirm the amount equals the database book subtotal.
6. Confirm the order changes from pending to paid, its cart items clear once, and duplicate webhook deliveries do not duplicate the paid transition.

The app currently accepts only a `sk_test_…` key, so a live key cannot start payments or validate webhooks by accident. The browser never supplies a payment amount. The server recalculates the cart from Supabase and creates order item price snapshots. The callback and webhook both verify the reference, success state, amount, and currency using Paystack's server API. The webhook HMAC is checked before processing.

## Mailgun

1. Create a Mailgun Free account.
2. For initial tests, use its sandbox domain and authorize the recipient email addresses in Mailgun. Sandbox email is limited to authorized recipients.
3. For email to any customer, add a domain you control and verify its DNS records in Mailgun.
4. Create a sending key for that domain, then set `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`, and `MAILGUN_REGION`.
5. Pay for a test order and check the customer confirmation. Set `ORDER_NOTIFICATION_EMAIL` if the seller should also receive a notice.

An email failure leaves the order paid and is recorded as `failed` in the order email status. The customer can still view the order.

The deployed store uses a Mailgun US sandbox. An authorized recipient received the confirmation for paid test order `GH-20261001-C71566FC`. Other addresses cannot receive a confirmation from this sandbox. A verified sending domain is required before unrestricted customer email is available. While `MAILGUN_ENABLED=false`, payment processing does not contact Mailgun, and order email status remains pending for later follow-up.

For HNG review while the sandbox is in use, give the reviewer the `/reviewer-email` URL and the private `REVIEWER_INVITE_CODE` in the submission notes. The reviewer signs in with Google, enters the code, confirms Mailgun's invitation in that same inbox, and then checks out using that email. The server takes the destination email only from the verified Supabase Google account; the browser cannot choose another recipient. The sandbox holds at most five authorized addresses, including the owner's address. Keep the code out of the public repository and rotate or remove it after review.

On October 2, 2026, a newly added custom Mailgun domain was automatically disabled with reason `Business Verification`. Mailgun's Free plan permits one custom domain, and its API would not delete this disabled domain. This requires Mailgun's review before unrestricted customer email can be enabled. The sandbox remains the tested email path.

## Deployment

The current Netlify Free deployment uses the site URL, Supabase credentials, Paystack **test** secret, and Mailgun sandbox settings from Netlify environment variables. New versions can be uploaded with `python scripts/package-netlify.py` and Netlify's manual deploy file chooser. The Paystack Test Webhook URL is set to the deployed HTTPS origin followed by `/api/payments/webhook`.

The original brief mentioned Vercel, but Vercel Hobby is limited to non-commercial use. Netlify Free allows commercial projects within its free usage limits. A custom domain is optional for the website; Mailgun requires a verified sending domain for unrestricted customer email.

## Checks before public launch

- Verify all six real covers, prices, product pages, responsive layouts, and accessibility.
- Confirm business prices, available stock, contact details, and an approved privacy/returns policy.
- Verify the Paystack webhook delivery and repeat the full order flow after any payment changes.
- Verify a custom Mailgun sending domain before allowing orders from arbitrary customer email addresses.
- Test failed or abandoned payment: the cart must remain.
- Test duplicate callbacks and webhooks: payment and emails must not process twice.
- Review concurrent stock handling before using finite stock counts with live payments.
- Keep live Paystack keys out of the app until the test flow works and the business is ready for real payments.

## Commands

`npm run dev` starts local development. `npm run typecheck`, `npm run lint`, and `npm run build` check the project.
