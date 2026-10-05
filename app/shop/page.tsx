import type { Metadata } from "next";
import { BookCard } from "@/components/BookCard";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Shop Books" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  const selected = subject === "English" || subject === "Mathematics" ? subject : "All";
  const books = (await getProducts()).filter(book => selected === "All" || book.subject === selected);
  return <div className="wrap"><div className="page-head"><h1 className="page-title">Shop Books</h1><p className="body-copy">Explore our English and Mathematics reasoning books for young learners.</p></div><div className="filters" aria-label="Filter by subject">{["All","English","Mathematics"].map(filter => <a className="filter" href={filter === "All" ? "/shop" : `/shop?subject=${filter}`} aria-current={selected === filter ? "page" : undefined} key={filter}>{filter}</a>)}</div><div className="book-grid">{books.map(book => <BookCard key={book.slug} book={book}/>)}</div></div>;
}
