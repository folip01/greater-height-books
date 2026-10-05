import { createServerSupabase } from "@/lib/supabase/server";

export type CartLine = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    slug: string;
    name: string;
    subject: string;
    book_number: string;
    image_url: string;
    price_kobo: number;
    stock_quantity: number | null;
    is_active: boolean;
  };
};

export async function getCart(): Promise<CartLine[]> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("cart_items")
    .select("id, product_id, quantity, product:products(slug, name, subject, book_number, image_url, price_kobo, stock_quantity, is_active)")
    .eq("user_id", user.id).order("created_at");
  if (error) throw new Error("Unable to load your cart right now.");
  return (data ?? []) as unknown as CartLine[];
}
