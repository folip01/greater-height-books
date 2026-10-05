-- Allow authenticated clients to receive their own cart INSERT/UPDATE events.
-- Existing cart_items SELECT policies still enforce per-user access.
alter publication supabase_realtime add table public.cart_items;
