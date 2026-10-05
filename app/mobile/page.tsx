import type { Metadata } from "next";
import Link from "next/link";
import { BookCard } from "@/components/BookCard";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Mobile Shop" };

export default async function MobileShopPage() {
  const books = await getProducts();
  return <div className="wrap mobile-shop">
    <div className="page-head">
      <h1 className="page-title">Your bookshop</h1>
      <p className="body-copy">English and Mathematics books for young learners.</p>
    </div>
    <div className="mobile-shop-actions">
      <Link href="/cart" className="button">View Cart</Link>
      <Link href="/account" className="button button-secondary">My Account</Link>
    </div>
    <p className="mobile-install-note">On Android, open this page in Chrome and choose <strong>Install app</strong> from the browser menu to add Greater Height Books to your phone.</p>
    <div className="book-grid">{books.map(book => <BookCard key={book.slug} book={book}/>)}</div>
  </div>;
}
