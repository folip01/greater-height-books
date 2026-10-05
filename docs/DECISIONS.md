# Greater Height Books — decisions

- The six supplied book images are the actual products. The unaltered full spreads are stored in `public/books/originals`. Exact front-cover crops are stored in `public/books` for the storefront, preserving the original artwork and text. Regenerate them with `node scripts/crop-book-covers.mjs`.
- All six initial books are listed at ₦3,500 (350000 kobo), as specified in the supplied brief. Confirm the business price before taking live payments.
- Supabase PostgreSQL is used for product, cart, profile, and order data; Supabase Auth handles Google sessions. Google OAuth credentials come from Google Cloud Console.
- Current checkout charges the book subtotal only. Delivery is shown as "to be confirmed" and is never represented as free unless the business explicitly sets a zero fee. Location-based rates are deferred; the future approach is in `docs/DELIVERY_PRICING_BLUEPRINT.md`.
- Paystack hosted checkout is used. The server creates an immutable order snapshot and initializes the amount from database prices. A return URL and a signed webhook both verify the transaction with Paystack before the order is marked paid.
- Mailgun sending is enabled with a US sandbox for an authorized test recipient. A paid Paystack test order triggered a customer confirmation that was received on October 1, 2026. The code sends only after verified payment; email failure does not reverse payment. Seller notification is sent when `ORDER_NOTIFICATION_EMAIL` is configured. A protected reviewer setup page lets a Google-authenticated reviewer accept a sandbox invitation for their own email, within Mailgun's five-recipient limit. The sandbox cannot send to arbitrary customer addresses until the business verifies a sending domain; a custom domain added on October 2 was disabled pending Mailgun Business Verification.
- Netlify Free hosts the current test store. A custom domain is optional for the site but needed for Mailgun email to unrestricted recipients.
- Stock is nullable until actual quantities are provided. A product explicitly set to zero cannot be ordered. Concurrent payments against a finite stock value require inventory reservation or manual reconciliation before live launch.
- Paystack stays in test mode until the business is ready to fulfil real orders and the remaining webhook and stock handling checks are complete.
- For HNG Lesson 3, a signed Android Trusted Web Activity APK wraps the installable PWA at `/mobile`. It shares the production origin, Supabase Auth account, and Supabase cart API with the website. Cart insert and update events stream through Supabase Realtime; the cart also refreshes on focus after a device reconnects. The owner's physical-phone PWA test confirmed website-to-phone cart sync. The APK and its two-way cart behavior require a separate physical-phone check.

## Still needed from the business

1. Confirm the six ₦3,500 prices and stock quantities.
2. Provide public contact details and an approved privacy/returns policy before public launch.
3. Decide the delivery pricing and collection policy later, as documented in the supplied blueprint.
4. Provide a verified Mailgun sending domain when confirmations must reach arbitrary customer addresses.
