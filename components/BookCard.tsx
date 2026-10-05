import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { AddToCartButton } from "@/components/AddToCartButton";
import { bookTitle, type Book } from "@/lib/catalog";
import { formatNaira } from "@/lib/currency";

export function BookCard({ book }: { book: Book }) {
  return <article className="book-card">
    <Link href={`/books/${book.slug}`} aria-label={`View ${bookTitle(book)}`}><BookCover book={book}/></Link>
    <div className="subject">{book.subject} 2</div>
    <h3><Link href={`/books/${book.slug}`}>{book.name}</Link></h3>
    <div className="book-number">Book {book.book_number}</div>
    <div className="price">{formatNaira(book.price_kobo)}</div>
    <AddToCartButton productId={book.id} productSlug={book.slug} disabled={book.stock_quantity === 0} compact/>
  </article>;
}
