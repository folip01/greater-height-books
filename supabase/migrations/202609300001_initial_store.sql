create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subject text not null check (subject in ('English','Mathematics')),
  book_number text not null,
  author text not null,
  description text not null default '',
  price_kobo integer not null check (price_kobo >= 0),
  image_url text not null,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  order_reference text not null unique,
  customer_name text not null,
  customer_email text not null,
  phone text not null,
  street_address text not null,
  city text not null,
  state text not null,
  subtotal_kobo integer not null check (subtotal_kobo >= 0),
  delivery_fee_kobo integer check (delivery_fee_kobo is null or delivery_fee_kobo >= 0),
  delivery_status text not null default 'to_be_confirmed' check (delivery_status in ('to_be_confirmed','quoted','free')),
  total_kobo integer not null check (total_kobo >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  order_status text not null default 'pending_payment' check (order_status in ('pending_payment','processing','completed','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  payment_provider text not null default 'paystack',
  payment_reference text not null unique,
  paid_at timestamptz,
  customer_email_status text not null default 'pending' check (customer_email_status in ('pending','sending','sent','failed')),
  customer_email_sent_at timestamptz,
  seller_email_status text not null default 'pending' check (seller_email_status in ('pending','sending','sent','failed')),
  seller_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_kobo = subtotal_kobo + coalesce(delivery_fee_kobo, 0))
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_kobo integer not null check (unit_price_kobo >= 0),
  subtotal_kobo integer not null check (subtotal_kobo = unit_price_kobo * quantity)
);

create index cart_items_user_id_idx on public.cart_items(user_id);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.touch_updated_at();
create trigger cart_items_updated_at before update on public.cart_items for each row execute function public.touch_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.touch_updated_at();

create function public.create_profile_for_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, email, full_name, avatar_url)
  values(new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict(id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.profiles, public.products, public.cart_items, public.orders, public.order_items from anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.cart_items to authenticated;
grant select on table public.orders, public.order_items to authenticated;
grant select, insert, update, delete on table public.profiles, public.products, public.cart_items, public.orders, public.order_items to service_role;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.create_profile_for_user() from public, anon, authenticated;

create policy "Public can read active books" on public.products for select to anon, authenticated using (is_active = true);
create policy "Customers can read books in own cart" on public.products for select to authenticated using (
  exists (select 1 from public.cart_items c where c.product_id = products.id and c.user_id = (select auth.uid()))
);
create policy "Customers can read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Customers can insert own profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "Customers can update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Customers can read own cart" on public.cart_items for select to authenticated using (user_id = (select auth.uid()));
create policy "Customers can add own cart items" on public.cart_items for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Customers can update own cart items" on public.cart_items for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Customers can remove own cart items" on public.cart_items for delete to authenticated using (user_id = (select auth.uid()));
create policy "Customers can read own orders" on public.orders for select to authenticated using (user_id = (select auth.uid()));
create policy "Customers can read own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));

create function public.create_pending_order(
  p_user_id uuid, p_reference text, p_payment_reference text,
  p_name text, p_email text, p_phone text, p_street text, p_city text, p_state text
) returns table(order_id uuid, amount_kobo integer)
language plpgsql security definer set search_path = '' as $$
declare
  v_subtotal bigint;
  v_order_id uuid;
  v_count integer;
begin
  if p_user_id is null or not exists(select 1 from public.profiles where id = p_user_id) then raise exception 'CUSTOMER_NOT_FOUND'; end if;
  if length(trim(p_name)) < 2 or length(trim(p_email)) < 5 or length(trim(p_phone)) < 7 or length(trim(p_street)) < 5 or length(trim(p_city)) < 2 or length(trim(p_state)) < 2 then raise exception 'INVALID_DETAILS'; end if;
  perform 1 from public.cart_items c join public.products p on p.id = c.product_id
    where c.user_id = p_user_id order by p.id for share of c, p;
  select count(*), sum(c.quantity::bigint * p.price_kobo::bigint)
    into v_count, v_subtotal
  from public.cart_items c join public.products p on p.id = c.product_id
  where c.user_id = p_user_id and p.is_active = true and (p.stock_quantity is null or p.stock_quantity >= c.quantity);
  if v_count = 0 then raise exception 'EMPTY_CART'; end if;
  if v_count <> (select count(*) from public.cart_items where user_id = p_user_id) then raise exception 'CART_ITEM_UNAVAILABLE'; end if;
  if v_subtotal is null or v_subtotal <= 0 or v_subtotal > 2147483647 then raise exception 'INVALID_TOTAL'; end if;
  insert into public.orders(user_id, order_reference, customer_name, customer_email, phone, street_address, city, state, subtotal_kobo, delivery_fee_kobo, delivery_status, total_kobo, payment_reference)
  values(p_user_id, p_reference, trim(p_name), trim(p_email), trim(p_phone), trim(p_street), trim(p_city), trim(p_state), v_subtotal::integer, null, 'to_be_confirmed', v_subtotal::integer, p_payment_reference)
  returning id into v_order_id;
  insert into public.order_items(order_id, product_id, product_name, quantity, unit_price_kobo, subtotal_kobo)
  select v_order_id, p.id, case when p.subject = 'English' then 'English 2' else 'Maths 2' end || ' — ' || p.name || ' — Book ' || p.book_number,
         c.quantity, p.price_kobo, c.quantity * p.price_kobo
  from public.cart_items c join public.products p on p.id = c.product_id where c.user_id = p_user_id;
  return query select v_order_id, v_subtotal::integer;
end; $$;

create function public.finalize_paid_order(p_payment_reference text, p_amount_kobo integer, p_currency text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  select * into v_order from public.orders where payment_reference = p_payment_reference for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.payment_status = 'paid' then return false; end if;
  if v_order.payment_status <> 'pending' or v_order.total_kobo <> p_amount_kobo or v_order.currency <> p_currency then raise exception 'PAYMENT_MISMATCH'; end if;
  update public.orders set payment_status = 'paid', order_status = 'processing', paid_at = now() where id = v_order.id;
  for v_item in select product_id, quantity from public.order_items where order_id = v_order.id loop
    update public.cart_items set quantity = quantity - v_item.quantity
      where user_id = v_order.user_id and product_id = v_item.product_id and quantity > v_item.quantity;
    if not found then
      delete from public.cart_items where user_id = v_order.user_id and product_id = v_item.product_id and quantity <= v_item.quantity;
    end if;
    update public.products set stock_quantity = greatest(stock_quantity - v_item.quantity, 0)
      where id = v_item.product_id and stock_quantity is not null;
  end loop;
  return true;
end; $$;

revoke all on function public.create_pending_order(uuid,text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.finalize_paid_order(text,integer,text) from public, anon, authenticated;
grant execute on function public.create_pending_order(uuid,text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.finalize_paid_order(text,integer,text) to service_role;
