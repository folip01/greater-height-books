# Delivery pricing by location — future blueprint

Delivery prices and supported areas have not been agreed. The current store charges only for books. Checkout, orders, and emails say that delivery is **to be confirmed**, and `orders.delivery_fee_kobo` is `null`, rather than treating an unknown fee as free.

## Business decisions needed first

1. Define supported areas and the rate level: state, city, local government area, or named zone.
2. Decide on pickup, free delivery, manual quotes, and unsupported locations.
3. Decide whether size, weight, quantity, speed, or courier changes the fee.
4. Decide whether delivery is paid with the books or as a separate charge after the order.
5. Assign who can change rates and how customers approve a changed quote.

## Implementation after those decisions

- Keep seller-managed locations and active rates in Supabase. Store fees as integer kobo and use stable location IDs and a clear priority for overlapping rules.
- Let the customer choose a supported location and enter a street address. Resolve the rate on the server; never accept a browser-supplied fee or total.
- Return a quote containing the location, fee, currency, and rate version or expiry. Recheck it before creating the order and starting Paystack. Ask the customer to accept any changed quote.
- Save the accepted location and rate version, delivery status, fee, and total on the order. Later rate changes must not alter historical orders.
- Handle unmatched and unsupported addresses explicitly as “quote required” or “delivery unavailable.” A zero fee means the seller deliberately offered free delivery.
- If delivery is included in Paystack, send the server-calculated books plus delivery total and verify exactly that amount in the callback and webhook. If delivery is paid later, track its quote and payment separately; a paid book order must not imply paid delivery.
- Include the delivery status in both customer and seller emails. Test free, paid, changed, unmatched, unsupported, and manually quoted cases before release.

Until the policy is approved, do not publish a rate table or collect a delivery fee online.
