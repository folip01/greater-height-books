import { createBrowserSupabase } from "@/lib/supabase/client";

export async function addProductToCart(
  supabase: ReturnType<typeof createBrowserSupabase>,
  userId: string,
  productId: string,
  quantity: number,
) {
  const { data: book, error: bookError } = await supabase.from("products")
    .select("id, is_active, stock_quantity").eq("id", productId).single();
  if (bookError || !book?.is_active || book.stock_quantity === 0) {
    throw new Error("This book is currently unavailable.");
  }

  const { data: existing, error: lookupError } = await supabase.from("cart_items")
    .select("id, quantity").eq("user_id", userId).eq("product_id", productId).maybeSingle();
  if (lookupError) throw lookupError;

  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (book.stock_quantity !== null && nextQuantity > book.stock_quantity) {
    throw new Error("The requested quantity exceeds current stock.");
  }

  const { error } = await supabase.from("cart_items").upsert(
    { user_id: userId, product_id: productId, quantity: nextQuantity },
    { onConflict: "user_id,product_id" },
  );
  if (error) throw error;
}
