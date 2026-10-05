import { catalogue, type Book } from "@/lib/catalog";
import { createServerSupabase } from "@/lib/supabase/server";

export async function getProducts(): Promise<Book[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return catalogue;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, subject, book_number, author, description, price_kobo, image_url, stock_quantity, is_active")
    .eq("is_active", true)
    .order("subject")
    .order("book_number");
  if (error) throw new Error("Unable to load books right now.");
  return (data ?? []) as Book[];
}

export async function getProduct(slug: string): Promise<Book | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
