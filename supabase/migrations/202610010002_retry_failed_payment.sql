create or replace function public.finalize_paid_order(p_payment_reference text, p_amount_kobo integer, p_currency text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  select * into v_order from public.orders where payment_reference = p_payment_reference for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.payment_status = 'paid' then return false; end if;
  -- A failed attempt can be retried by the customer under the same reference.
  if v_order.payment_status not in ('pending', 'failed') or v_order.total_kobo <> p_amount_kobo or v_order.currency <> p_currency then raise exception 'PAYMENT_MISMATCH'; end if;
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
