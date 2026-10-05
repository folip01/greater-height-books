# AGENTS.md — Greater Height Books

You are a senior full-stack engineer and product designer building a real
educational ecommerce website called **Greater Height Books**.

This project serves two purposes:

1. It satisfies an HNG Lesson 2 Individual Task.
2. It will become a real online storefront for an existing educational
   book business.

This is NOT a throwaway demo.

The website should be clean enough, secure enough and maintainable enough
to continue being used after the HNG task is submitted.

Read this entire document before changing or writing code.

When a requirement is ambiguous:

- choose the simplest reliable implementation;
- avoid overengineering;
- document meaningful assumptions in `docs/DECISIONS.md`;
- continue unless the decision could affect payments, security or data loss.

If a decision involves money, payment verification, deleting customer data,
or weakening security, do not guess.

---

# 1. HNG TASK REQUIREMENTS

The HNG Lesson 2 Individual Task requires:

1. Build a website for a shop.
2. Add a checkout page.
3. Persist data in a database using Supabase or Neon.
4. Send confirmation emails using Mailgun.
5. Implement Google authentication using Google Cloud Console.

This implementation MUST satisfy all five.

We will use:

- Supabase PostgreSQL for persistence
- Mailgun for confirmation emails
- Google OAuth configured in Google Cloud Console
- Supabase Auth to manage authenticated sessions
- Paystack as an additional real payment system

Paystack does NOT replace any HNG requirement.

---

# 2. BUSINESS CONTEXT

Greater Height Books sells educational books for young learners.

The uploaded product images are real books currently being sold.

The books are authored by:

F.O. Bamidele

Do not describe this website as:

- a demo shop
- a sample store
- a fictional business
- an HNG practice store

The customer-facing website must appear as a real bookstore.

HNG information may appear in the README for submission/documentation,
but not in customer-facing marketing copy.

---

# 3. INITIAL PRODUCT CATALOGUE

There are six products.

## English

### English 2 — Greater Height to Verbal Reasoning — Book 02

Slug:

`english-2-book-02`

Price:

₦3,500

Database price:

350000 kobo

Image:

`/books/english-book-02.jpg`

---

### English 2 — Greater Height to Verbal Reasoning — Book 04

Slug:

`english-2-book-04`

Price:

₦3,500

Database price:

350000 kobo

Image:

`/books/english-book-04.jpg`

---

### English 2 — Greater Height to Verbal Reasoning — Book 05

Slug:

`english-2-book-05`

Price:

₦3,500

Database price:

350000 kobo

Image:

`/books/english-book-05.jpg`

---

## Mathematics

### Maths 2 — Greater Height to Quantitative Reasoning — Book 02

Slug:

`maths-2-book-02`

Price:

₦3,500

Database price:

350000 kobo

Image:

`/books/maths-book-02.jpg`

---

### Maths 2 — Greater Height to Quantitative Reasoning — Book 04

Slug:

`maths-2-book-04`

Price:

₦3,500

Database price:

350000 kobo

Image:

`/books/maths-book-04.jpg`

---

### Maths 2 — Greater Height to Quantitative Reasoning — Book 05

Slug:

`maths-2-book-05`

Price:

₦3,500

Database price:

350000 kobo

Image:

`/books/maths-book-05.jpg`

---

# 4. MONEY STORAGE

Do not store monetary values as JavaScript floating point values.

Store prices as integers in kobo.

Example:

₦3,500 = 350000 kobo

Use fields such as:

`price_kobo`

`subtotal_kobo`

`total_kobo`

When displaying money:

350000 → ₦3,500

All payment calculations must happen server-side.

Never trust totals received from the browser.

---

# 5. PRODUCT IMAGES

The supplied book images are the real products.

Use them.

Do not:

- replace them with generated images
- redesign the book covers
- generate fake mockups instead
- alter titles
- remove the author
- change artwork

Some supplied source images contain both the back and front cover in one
landscape image.

Create clean front-cover derivatives for ecommerce product cards where
necessary.

Preserve the original source image separately.

Suggested structure:

`/public/books/originals/`

and

`/public/books/`

The product catalogue should show the FRONT COVER clearly.

Do not crop away:

- title
- book number
- author
- important artwork

---

# 6. TECHNOLOGY STACK

Use:

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Google OAuth
- Google Cloud Console
- Paystack
- Mailgun
- Netlify

Prefer server components where sensible.

Use client components only when interactivity requires them.

Do not introduce large unnecessary libraries.

Do not introduce a state management framework unless genuinely needed.

---

# 7. APPLICATION ROUTES

Create approximately:

`/`
Home

`/shop`
Full product catalogue

`/books/[slug]`
Product details

`/cart`
Shopping cart

`/checkout`
Checkout

`/auth/callback`
Authentication callback

`/orders/[reference]`
Order details

`/order/success`
Payment success result where appropriate

`/order/payment-failed`
Payment failure result where appropriate

Server API routes should be organized under:

`/api/...`

as appropriate.

---

# 8. CUSTOMER JOURNEY

The intended customer flow is:

Home

→ Browse Shop

→ View Book

→ Add to Cart

→ Cart

→ Checkout

→ Google sign-in if required

→ Enter delivery information

→ Server creates pending order

→ Server initializes Paystack transaction

→ Customer completes Paystack payment

→ Server verifies payment

→ Paystack webhook also confirms successful payment

→ Order becomes paid

→ Cart is cleared

→ Mailgun confirmation email is sent

→ Customer sees order confirmation

---

# 9. HOMEPAGE

Build a genuine bookstore homepage.

Recommended structure:

Header

Hero

Featured Books

English Books

Mathematics Books

Short information about Greater Height Books

Footer

Keep it focused.

Do not add sections simply to make the homepage longer.

---

# 10. HERO SECTION

Use a straightforward editorial/ecommerce hero.

Desktop:

Left:

Headline

Supporting text

Shop Books CTA

Right:

Real supplied book covers arranged cleanly.

Possible headline:

"Books that help young learners grow."

Possible supporting copy:

"Explore English and Mathematics learning books designed to strengthen
reasoning, confidence and essential classroom skills."

Primary CTA:

"Shop Books"

Do not create a giant SaaS hero.

Do not use:

- floating dashboard cards
- fake metrics
- glowing backgrounds
- light beams
- gradient blobs
- meaningless floating icons

The products should provide the visual personality.

---

# 11. SHOP PAGE

Display all six products.

Include a simple category selector:

All

English

Mathematics

Do not overdesign the filters.

Product cards should show:

- front cover
- subject
- title
- book number
- price
- Add to Cart

Price:

₦3,500

Do not place each product inside a giant floating card.

Prefer whitespace and alignment.

---

# 12. PRODUCT PAGE

Desktop layout:

Left:

Large front cover

Right:

Subject

Book title

Book number

Author

Price

Description

Quantity

Add to Cart

Use:

Author: F.O. Bamidele

Do not surround the whole page with a decorative card.

---

# 13. CART

The cart must be functional.

Show:

- product image
- product name
- unit price
- quantity
- line subtotal
- remove action

Allow:

- increase quantity
- decrease quantity
- remove product

Show order subtotal clearly.

Example:

English Book 02

₦3,500 × 2

₦7,000

Total:

₦7,000

Cart changes should be persisted in Supabase for authenticated users.

Do not treat localStorage as the authoritative cart database.

---

# 14. AUTHENTICATION

Implement Google authentication.

IMPORTANT:

The OAuth application credentials must be created through Google Cloud
Console.

Supabase Auth may manage the user session and Google provider integration,
but Google OAuth credentials must originate from Google Cloud Console.

Implement:

"Continue with Google"

After authentication:

- obtain verified identity from Supabase Auth;
- create or update the user's profile;
- return the user to the intended destination.

Do not expose:

- client secrets
- service role keys
- sensitive Google credentials

in browser JavaScript.

---

# 15. CHECKOUT

Checkout is a core HNG requirement.

The checkout page must be real and functional.

Collect:

Full name

Email

Phone number

Street address

City

State

Email should default to the authenticated Google account where available.

Allow appropriate editing where needed.

Display an order summary beside or below the form.

Show:

Products

Quantities

Subtotal

Amount to be charged

The amount charged online in v1 is the book subtotal.

Do NOT invent delivery fees.

Display a clear note that delivery arrangements or applicable delivery
charges will be confirmed separately if that is the current business rule.

Do not silently charge an arbitrary delivery amount.

---

# 16. PAYSTACK PAYMENT

Use Paystack as the online payment provider.

Payment initialization must happen server-side.

Never calculate the payable amount from values supplied by the browser.

Correct process:

1. Authenticate the customer.
2. Read the user's cart from Supabase.
3. Read current product prices from the products table.
4. Recalculate every line total server-side.
5. Calculate the final amount.
6. Create a pending order.
7. Create immutable order items containing the price at time of purchase.
8. Generate a unique Paystack reference.
9. Initialize the Paystack payment using the server-calculated total.
10. Return the Paystack authorization URL to the frontend.
11. Redirect the customer to Paystack.

The browser must not be able to choose the Paystack amount.

Example:

Database:

Book = 350000 kobo

Quantity = 3

Server:

350000 × 3 = 1050000 kobo

Customer sees:

₦10,500

Paystack receives:

1050000

---

# 17. PAYMENT VERIFICATION

Do not mark an order as paid merely because the user reaches a success URL.

After Paystack redirects back:

verify the transaction from the server.

The verification must confirm:

- transaction was successful
- payment reference matches
- amount matches expected order total
- currency is correct
- order exists
- order has not already been processed

Only after verification may the order become:

`paid`

---

# 18. PAYSTACK WEBHOOK

Implement a Paystack webhook endpoint.

This is required for payment reliability.

Do not rely solely on the browser redirect.

A customer may:

- successfully pay
- close the browser
- lose internet
- never reach our success page

Paystack's webhook should still allow the system to record the payment.

Verify webhook authenticity before trusting its contents.

For a successful payment event:

find the matching order.

Verify the expected payment information.

Mark the order paid only if appropriate.

Webhook processing must be idempotent.

Receiving the same event multiple times must NOT:

- duplicate the order
- duplicate order items
- clear multiple carts incorrectly
- send multiple customer receipts unnecessarily

---

# 19. PAYMENT STATES

Order/payment state should support:

`pending_payment`

`paid`

`payment_failed`

`processing`

`completed`

`cancelled`

Payment status and fulfilment status may be separated if that makes the
implementation cleaner.

Do not label unpaid orders as paid.

---

# 20. ORDER REFERENCES

Generate customer-friendly order references.

Example:

`GH-20260930-A7F3`

Do not expose predictable sequential database IDs as the primary public
reference.

Order references must be unique.

---

# 21. DATABASE

Use Supabase PostgreSQL.

All meaningful application data must persist in the database.

At minimum create:

- profiles
- products
- cart_items
- orders
- order_items

---

# 22. PROFILES TABLE

Suggested fields:

`id uuid primary key references auth.users(id)`

`email text`

`full_name text`

`avatar_url text nullable`

`phone text nullable`

`created_at timestamptz default now()`

`updated_at timestamptz default now()`

---

# 23. PRODUCTS TABLE

Suggested fields:

`id uuid primary key`

`name text not null`

`slug text unique not null`

`subject text not null`

`book_number text not null`

`author text not null`

`description text`

`price_kobo integer not null`

`image_url text not null`

`stock_quantity integer`

`is_active boolean default true`

`created_at timestamptz default now()`

`updated_at timestamptz default now()`

Initial author:

F.O. Bamidele

Initial price for every product:

350000 kobo

---

# 24. CART ITEMS TABLE

Suggested fields:

`id uuid primary key`

`user_id uuid references profiles(id)`

`product_id uuid references products(id)`

`quantity integer not null`

`created_at timestamptz default now()`

`updated_at timestamptz default now()`

Unique constraint:

`user_id + product_id`

Do not allow quantity below 1.

---

# 25. ORDERS TABLE

Suggested fields:

`id uuid primary key`

`user_id uuid references profiles(id)`

`order_reference text unique not null`

`customer_name text not null`

`customer_email text not null`

`phone text not null`

`street_address text not null`

`city text not null`

`state text not null`

`subtotal_kobo integer not null`

`delivery_fee_kobo integer default 0`

`total_kobo integer not null`

`currency text default 'NGN'`

`order_status text not null`

`payment_status text not null`

`payment_provider text`

`payment_reference text unique`

`paid_at timestamptz nullable`

`created_at timestamptz default now()`

`updated_at timestamptz default now()`

---

# 26. ORDER ITEMS TABLE

Suggested fields:

`id uuid primary key`

`order_id uuid references orders(id)`

`product_id uuid references products(id)`

`product_name text not null`

`quantity integer not null`

`unit_price_kobo integer not null`

`subtotal_kobo integer not null`

Store the product name and purchase price in the order item.

Do not depend on the current products table price when viewing old orders.

If the book later changes from ₦3,500 to ₦4,000, a historical order should
still show ₦3,500.

---

# 27. ROW LEVEL SECURITY

Enable Supabase Row Level Security where applicable.

Products:

public users may read active products.

Customers:

may access only their own profile.

Customers:

may access only their own cart.

Customers:

may access only their own orders.

Do not allow a customer to:

- edit product prices
- modify another customer's order
- mark an order paid
- alter payment references
- alter payment status

Sensitive payment state changes should occur through trusted server code.

---

# 28. STOCK

Keep stock support in the schema because this is a real business.

Do not let customers purchase an explicitly out-of-stock product.

For the initial build, stock may be managed manually through Supabase.

Do not build a giant admin dashboard just for HNG.

The Supabase dashboard is acceptable for initial stock/product management.

Admin tooling can be added later.

---

# 29. MAILGUN

Mailgun is mandatory because of the HNG task.

Send the customer a confirmation email after payment has been successfully
verified.

Do not send a "payment successful" email before payment verification.

Suggested subject:

"Your Greater Height Books Order Has Been Confirmed"

Include:

- customer name
- order reference
- books purchased
- quantities
- amount paid
- delivery address summary
- confirmation message

Example:

Hi Paul,

Thank you for ordering from Greater Height Books.

Order: GH-20260930-A7F3

English 2 — Book 02
₦3,500 × 1

Maths 2 — Book 04
₦3,500 × 2

Amount paid:
₦10,500

Your order has been received successfully.

We will contact you regarding delivery where necessary.

Thank you for choosing Greater Height Books.

Mailgun must run server-side.

Do not expose the Mailgun API key to the browser.

---

# 30. SELLER ORDER EMAIL

Because this is a real shop, also support sending an order notification
to the seller.

Use an environment variable such as:

`ORDER_NOTIFICATION_EMAIL`

Seller email should contain:

- order reference
- customer
- phone
- email
- delivery address
- products
- quantities
- amount
- payment status

If this email feature complicates initial HNG completion, customer
confirmation takes priority because that is the explicit assignment
requirement.

---

# 31. EMAIL FAILURE

A Mailgun failure must NOT reverse a successful payment.

If:

payment succeeded

but:

email sending failed

then:

- keep the order paid
- log the mail failure safely
- still show the customer the successful order
- allow manual follow-up

Never mark payment failed because Mailgun failed.

---

# 32. CART CLEARING

Do not clear the customer's cart simply when Paystack is opened.

Clear the purchased cart after a verified successful payment.

If payment fails or is abandoned:

leave the cart available.

---

# 33. DUPLICATE PAYMENT SAFETY

Prevent accidental double processing.

Payment verification and webhook processing must be idempotent.

If an order is already paid:

do not process it again.

Do not send multiple identical confirmation emails due to duplicate webhook
delivery.

Use unique constraints and server-side checks.

---

# 34. ENVIRONMENT VARIABLES

Create `.env.example`.

Include fields similar to:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=
ORDER_NOTIFICATION_EMAIL=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

Do not commit real secrets.

Never expose:

SUPABASE_SECRET_KEY

PAYSTACK_SECRET_KEY

MAILGUN_API_KEY

to client-side code.

---

# 35. VISUAL DESIGN PRINCIPLE

The website must feel like a real human-designed educational bookstore.

It must NOT look obviously AI-generated or "vibe coded."

The uploaded book covers are already colourful.

Let the PRODUCTS provide most of the colour.

The interface surrounding the products should be restrained.

Think:

- established educational publisher
- children's bookstore
- school book supplier
- small real ecommerce brand

Do NOT make it resemble:

- an AI startup
- SaaS landing page
- crypto website
- developer portfolio
- futuristic dashboard

---

# 36. STRICT ANTI-VIBECODE DESIGN RULES

Do NOT independently "improve" the design using trendy effects.

Do NOT use:

- neon glows
- blue glowing lights
- purple glowing lights
- glowing buttons
- glowing borders
- gradient borders
- gradient text
- decorative light beams
- excessive gradients
- glassmorphism
- frosted cards
- blurred transparent panels
- random floating blobs
- floating orbs
- decorative grid backgrounds
- thin decorative lines everywhere
- excessive 1px borders
- cards nested inside cards
- giant rounded containers
- pill-shaped everything
- random badges
- random icons next to headings
- tiny uppercase labels above every heading
- fake statistics
- meaningless dashboard elements
- animated decorative backgrounds
- unnecessary motion
- shiny hover effects
- fake 3D elements
- generic AI-generated illustrations

When uncertain:

CHOOSE THE SIMPLER DESIGN.

Slightly understated is better than over-designed.

---

# 37. BORDERS

Do not cover the website in thin grey outlines.

Avoid borders around every:

- product
- section
- image
- container
- text block

Use borders when they have a functional purpose.

Good examples:

- form fields
- cart row separation
- a simple header divider
- table separation

Product cards should primarily use spacing instead of boxes.

---

# 38. SHADOWS

Use shadows minimally.

A book cover may receive a small natural shadow so that it looks like a
physical object against the page.

Do not make every component float.

Avoid generic combinations such as:

`rounded-3xl border shadow-xl`

on everything.

---

# 39. CORNERS

Use moderate radii.

Typical:

Buttons:

6px to 8px

Inputs:

6px to 8px

Cards when genuinely needed:

8px to 10px

Do not make the entire site pill-shaped.

---

# 40. COLOUR

Use a restrained base palette.

Suggested background:

warm white / off-white

Example:

`#FAF9F6`

Primary text:

dark charcoal / navy

Example:

`#172033`

Primary action:

deep educational blue

Example:

`#1557A0`

Optional accent:

muted warm yellow

Most vivid colours should come from the BOOK COVERS.

Do not create a rainbow interface just because the products are children's
books.

---

# 41. TYPOGRAPHY

Use a readable, mature sans-serif.

Suitable options:

- Inter
- DM Sans
- Source Sans 3
- Manrope

Do not use a futuristic technology font.

Do not use five different font families.

Let typography hierarchy create structure.

Suggested desktop ranges:

Main page heading:

40px to 52px

Section title:

26px to 32px

Product title:

17px to 20px

Body:

15px to 17px

Keep line lengths and line-height comfortable.

---

# 42. HEADER

Use a conventional ecommerce header.

Desktop:

Left:

Greater Height Books

Navigation:

Home

Shop

About if content exists

Right:

Account

Cart

Do not create:

- giant pill navbar
- floating navbar
- glowing navigation
- glass navigation

The header should look like something an ordinary professional retail site
would actually use.

---

# 43. PRODUCT PRESENTATION

The book is the hero.

A product listing should generally look like:

[BOOK COVER]

English

Greater Height to Verbal Reasoning

Book 02

₦3,500

Add to Cart

Do not put excessive information on product cards.

Do not box every item with a thick card.

Use consistent image heights while preserving the covers.

---

# 44. RESPONSIVE PRODUCT GRID

Design mobile-first.

Approximate layout:

Mobile:

1 or 2 columns depending on readability

Tablet:

2 columns

Desktop:

3 columns

Large desktop:

3 or 4 only if spacing remains natural

Do not squeeze five or six books across simply because space exists.

---

# 45. PRODUCT DETAIL DESIGN

Use a familiar ecommerce layout.

Desktop:

Cover on left.

Information on right.

Mobile:

Cover above information.

Show:

subject

title

author

book number

price

description

quantity

Add to Cart

Do not put the entire page in one giant rounded rectangle.

---

# 46. CART DESIGN

The cart should look functional, not decorative.

Desktop:

Product

Price

Quantity

Subtotal

Remove

Order summary beside it.

Use subtle separators.

On mobile:

stack content intelligently.

Do not put every cart row inside a floating glowing card.

---

# 47. CHECKOUT DESIGN

Checkout should prioritize trust and clarity.

Desktop:

Left:

Customer/delivery form

Right:

Order summary

Mobile:

Form

then summary/action in a sensible sequence

Use normal labels above fields.

Avoid animated floating labels.

Do not place each individual input inside a card.

Primary button:

"Continue to Payment"

or

"Pay ₦X"

depending on the current step.

---

# 48. PAYSTACK EXPERIENCE

Do not attempt to visually imitate Paystack checkout.

Use Paystack's real secure payment experience.

Before redirecting, make it obvious what amount will be charged.

Example:

Total:

₦10,500

Button:

"Pay ₦10,500"

After successful verified payment, show a restrained order confirmation.

Do not add giant glowing green animations.

A simple check icon and clear text is sufficient.

---

# 49. SUCCESS PAGE

Example:

Payment successful

Thank you for your order.

Order:

GH-20260930-A7F3

Amount paid:

₦10,500

Display purchased books.

Display delivery information.

Provide:

"Continue Shopping"

and optionally:

"View Order"

Keep the page calm.

---

# 50. FAILURE PAGE

If Paystack payment fails or is cancelled:

do not delete the cart.

Explain clearly that the payment was not completed.

Provide:

"Try Again"

and

"Return to Cart"

Do not use alarming error language unnecessarily.

---

# 51. FOOTER

Keep the footer simple.

Potential content:

Greater Height Books

Shop

English Books

Mathematics Books

Contact information when supplied

Copyright

Do not invent a huge corporate footer.

Do not add fake social accounts.

---

# 52. ACCESSIBILITY

Use semantic HTML.

Provide useful alt text.

Label every form input.

Make interactive controls keyboard accessible.

Maintain visible focus states.

Maintain adequate contrast.

Buttons must clearly look clickable.

Do not rely on colour alone for important state.

---

# 53. LOADING STATES

Handle loading gracefully for:

- authentication
- add to cart
- cart updates
- checkout
- Paystack initialization
- order verification

Disable actions while the same operation is already being processed.

Prevent duplicate payment submissions.

Do not use skeleton loaders everywhere unnecessarily.

---

# 54. ERROR HANDLING

Handle:

- Supabase unavailable
- authentication failure
- product unavailable
- cart empty
- payment initialization failure
- payment verification failure
- failed webhook
- Mailgun failure
- invalid form information
- duplicate payment callbacks

Show friendly user-facing messages.

Never expose:

- stack traces
- API keys
- database details
- internal errors

---

# 55. FORM VALIDATION

Validate checkout data both:

client-side for usability

and

server-side for security

Do not depend solely on client validation.

Validate:

- name
- email
- phone
- address
- city
- state

Use reasonable Nigerian phone support without overrestricting valid numbers.

---

# 56. SECURITY

Never trust browser-supplied:

- price
- total
- product title
- payment status
- user ID
- Paystack success claim

Use authenticated server context and database values.

Verify Paystack events server-side.

Use secure environment variables.

Keep service-role access on the server.

Do not log secrets.

Do not include secrets in error messages.

---

# 57. DATABASE MIGRATIONS

Store schema changes as migrations.

Do not depend only on manually clicking around the Supabase dashboard.

Create reproducible migrations for:

- tables
- indexes
- constraints
- policies
- seed structure where appropriate

Document how to apply them.

---

# 58. PRODUCT SEED

Create a repeatable product seed containing all six books.

All initial prices:

350000 kobo

All initial display prices:

₦3,500

Do not create fake additional products.

---

# 59. README

Create a useful `README.md`.

Include:

Project description

HNG requirements satisfied

Technology stack

Local setup

Environment variables

Supabase configuration

Database migrations

Product seeding

Google Cloud Console OAuth setup

Supabase Google provider setup

Paystack test configuration

Paystack webhook configuration

Mailgun configuration

Running locally

Production build

Netlify deployment

Testing payment flow

Do not put real API secrets in documentation.

---

# 60. DECISIONS DOCUMENT

Create:

`docs/DECISIONS.md`

Record major decisions such as:

- Paystack selected as payment provider
- all products currently cost ₦3,500
- monetary amounts stored in kobo
- Supabase selected instead of Neon
- Google authentication handled through Supabase using Google Cloud
  credentials
- customer email sent only after verified payment
- online payment currently covers book subtotal only unless delivery pricing
  is later defined

Do not fill this document with trivial implementation details.

---

# 61. PROJECT STRUCTURE

A reasonable structure is:

app/
  page.tsx

  shop/
    page.tsx

  books/
    [slug]/
      page.tsx

  cart/
    page.tsx

  checkout/
    page.tsx

  orders/
    [reference]/
      page.tsx

  order/
    success/
      page.tsx

    payment-failed/
      page.tsx

  auth/
    callback/
      route.ts

  api/
    checkout/
      route.ts

    payments/
      verify/
        route.ts

      webhook/
        route.ts

components/
  Header.tsx
  Footer.tsx
  BookCard.tsx
  ProductGrid.tsx
  AddToCartButton.tsx
  CartItem.tsx
  CartSummary.tsx
  CheckoutForm.tsx
  OrderSummary.tsx
  GoogleSignInButton.tsx

lib/
  supabase/
    client.ts
    server.ts
    admin.ts

  paystack.ts
  mailgun.ts
  currency.ts
  validation.ts

public/
  books/
  books/originals/

supabase/
  migrations/
  seed.sql

docs/
  DECISIONS.md

.env.example
README.md
AGENTS.md

Adjust structure when Next.js conventions require it.

Do not create unnecessary abstraction folders merely for appearance.

---

# 62. DEVELOPMENT PHASES

Build incrementally.

## Phase 1 — Foundation

- initialize Next.js
- TypeScript
- Tailwind
- base typography
- responsive header/footer
- homepage shell
- import supplied images

Verify build.

---

## Phase 2 — Database

- connect Supabase
- create migrations
- products
- profiles
- cart_items
- orders
- order_items
- RLS
- seed products

Verify database.

---

## Phase 3 — Catalogue

- homepage products
- shop
- categories
- product details
- ₦3,500 pricing
- real cover images

Verify responsive layout.

---

## Phase 4 — Google Authentication

- Google Cloud Console configuration documentation
- Supabase Google provider
- login
- callback
- session handling
- profiles

Verify login/logout.

---

## Phase 5 — Cart

- add
- update
- remove
- database persistence
- totals

Verify refresh persistence.

---

## Phase 6 — Checkout

- checkout form
- validation
- address
- order summary
- server-side total calculation
- pending order creation

Verify pending order.

---

## Phase 7 — Paystack

- initialize transaction server-side
- redirect to Paystack
- test mode
- transaction verification
- webhook
- idempotency
- paid status
- failed payment handling

Verify using Paystack TEST keys before live mode.

---

## Phase 8 — Mailgun

- customer confirmation
- seller notification if configured
- email failure handling

Verify Mailgun delivery.

---

## Phase 9 — Final Product Polish

- mobile testing
- tablet testing
- desktop testing
- accessibility
- loading states
- error states
- image presentation
- remove placeholder text
- remove temporary logs
- verify no vibecoded styling has slipped in

---

## Phase 10 — Production

- production build
- lint
- TypeScript check
- Netlify configuration
- Supabase production URLs
- Google production redirect URLs
- Paystack production webhook URL
- Mailgun production sender
- environment variables

Do not switch to Paystack LIVE keys until test payment flow works correctly.

---

# 63. REQUIRED ACCEPTANCE CHECKLIST

The project is not finished until all of the following work:

Shop loads all six real books.

Every book displays ₦3,500.

Product pages work.

Google login works.

Google credentials are configured via Google Cloud Console.

Cart works.

Cart data persists in Supabase.

Checkout page works.

Checkout information is persisted.

Server calculates prices.

Paystack initializes correctly.

Paystack amount matches database total.

Successful payment is verified.

Paystack webhook works.

Duplicate webhook delivery does not duplicate processing.

Paid order persists in Supabase.

Mailgun sends customer confirmation.

Payment remains successful if email delivery fails.

Failed/cancelled payments do not clear the cart.

Customer can view their order.

Site works on mobile.

Site works on desktop.

Production build succeeds.

No real secrets are committed.

README explains setup.

The site does not visually resemble a generic AI-generated SaaS template.

---

# 64. HNG COMPLIANCE CHECK

Before final submission, explicitly verify the original HNG Lesson 2
Individual Task:

"Build a website for a shop."

YES:
Greater Height Books is a functioning bookstore.

"Add a check-out page."

YES:
A complete checkout flow exists.

"Persist everything in a database using supabase/neon."

YES:
Supabase PostgreSQL stores application/business data.

"Send confirmation emails using mailgun."

YES:
Mailgun sends verified-order confirmation email.

"Do Google auth using Google Cloud Console."

YES:
Google OAuth credentials are created in Google Cloud Console and integrated
through Supabase Auth.

Paystack is an additional production feature and must not interfere with
these required items.

---

# 65. FINAL DESIGN REVIEW

Before saying the UI is finished, inspect every page and ask:

"Would an actual parent reasonably believe this is a real bookstore?"

and:

"Does this look intentionally designed, or does it look like somebody told
an AI to make a modern website?"

If it resembles the second:

simplify it.

Remove:

- decorative borders
- unnecessary cards
- glows
- gradients
- blobs
- excessive rounding
- visual clutter

Prioritize:

- real book imagery
- typography
- whitespace
- hierarchy
- alignment
- usability
- familiar ecommerce patterns

Do not add visual effects merely because a section feels empty.

Empty space is allowed.

The final result should feel human-designed, useful and credible.

---

# 66. FUTURE DELIVERY PRICING BY LOCATION — BLUEPRINT ONLY

Delivery pricing is a future feature. Do not implement location-based fees or
publish a rate table until the business has agreed on the actual delivery
policy and prices.

## Current checkout rule

- In v1, Paystack charges only the book subtotal, as specified in section 15.
- Show "Delivery fee: To be confirmed" and "Pay now: books only" wherever
  the checkout or order summary could otherwise imply delivery is free.
- Confirm delivery arrangements and any separate charge with the customer
  before collecting that charge. Do not add a fee after payment without the
  customer's agreement.
- In order records and emails, distinguish "not yet quoted" from an
  explicitly free delivery fee. A zero fee must mean free delivery, not an
  unknown fee.

## Decisions to make together before implementation

1. Which locations can be served, and at what level are rates defined
   (state, city, local government area, or named delivery zone)?
2. Are there pickup options, free-delivery areas or thresholds, and locations
   that require a manual quote?
3. Is the fee based only on location, or also on order size, weight, quantity,
   delivery speed, or courier choice?
4. Will customers pay books and delivery in one Paystack transaction, or pay
   delivery separately after the order is placed?
5. Who can change rates, how are changes approved, and how are customers
   handled when an address does not match a configured location?

## Proposed implementation when rates are approved

- Keep delivery locations and rates in Supabase, managed by the seller.
  Store monetary amounts as integer kobo. Use stable location IDs and a
  clear rate priority so overlapping rules cannot produce different fees.
- Let customers select a supported location in checkout and enter their
  detailed street address separately. The server resolves the selected
  location and calculates the quote from active rates. Never trust a
  browser-supplied delivery fee or total.
- Return a quote with its location, fee, currency, and expiry or rate
  version. Recheck the quote immediately before creating the order and
  initializing Paystack. If it changed, show the new total and ask the
  customer to confirm it before payment.
- Store the chosen location, address, delivery fee, rate/version or manual
  quote reference, and final amount on the order. Historical orders must
  retain their original delivery charge when rates change.
- Treat an unmatched or unsupported location as "quote required" or
  "delivery unavailable" according to the agreed policy. Never silently
  substitute a zero fee.
- If delivery is included in the same payment, display subtotal + delivery
  fee = amount payable and send that exact server-calculated total to
  Paystack. Payment verification and webhooks must compare the paid amount
  against the stored order total.
- If delivery is collected separately, display the amount due now and the
  still-unquoted delivery amount distinctly. Track the later delivery
  charge and its payment state separately; do not mark delivery paid merely
  because the books were paid for.
- Send the quoted or pending delivery status in customer and seller emails.
  Test supported, free, changed-rate, unmatched, and manual-quote cases
  before enabling location-based charges.

## Schema note for the later migration

The current suggested `orders.delivery_fee_kobo integer default 0` should
not represent an unknown delivery fee. When this feature is implemented,
use an explicit quote/status field and a nullable fee until a quote is
accepted, or another schema that preserves the same distinction. Keep the
initial v1 payment rule unchanged until the pricing and collection policy
above is agreed.

