import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/BookCover";
import { AddToCartButton } from "@/components/AddToCartButton";
import { bookTitle } from "@/lib/catalog";
import { formatNaira } from "@/lib/currency";
import { getProduct } from "@/lib/products";

export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getProduct(slug);
  return { title: book ? bookTitle(book) : "Book not found" };
}

export default async function BookPage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const book = await getProduct(slug);
  if (!book) notFound();
  return <div className="wrap"><div className="product-layout"><div className="product-visual"><BookCover book={book} priority/></div><div className="product-info"><Link href="/shop" className="text-link">← Back to shop</Link><div className="eyebrow" style={{marginTop:35}}>{book.subject} 2 · Book {book.book_number}</div><h1 className="page-title">{book.name}</h1><div className="price">{formatNaira(book.price_kobo)}</div><p className="body-copy">{book.description}</p><dl><dt>Author</dt><dd>{book.author}</dd><dt>Subject</dt><dd>{book.subject}</dd><dt>Book</dt><dd>{book.book_number}</dd></dl><AddToCartButton productId={book.id} productSlug={book.slug} disabled={book.stock_quantity === 0}/>{book.stock_quantity === 0 && <p className="error">This book is currently out of stock.</p>}</div></div></div>;
}
