import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { BookCard } from "@/components/BookCard";
import { InstallAppButton } from "@/components/InstallAppButton";
import { getProducts } from "@/lib/products";

export default async function HomePage() {
  const books = await getProducts();
  const english = books.filter(book => book.subject === "English");
  const mathematics = books.filter(book => book.subject === "Mathematics");
  return <>
    <div className="wrap hero"><div className="hero-copy"><div className="eyebrow">Greater Height Books</div><h1 className="page-title">Books that help young learners grow.</h1><p className="body-copy">Explore English and Mathematics books designed to strengthen reasoning, confidence and essential classroom skills.</p><div className="hero-actions"><Link className="button" href="/shop">Shop Books</Link><InstallAppButton/></div></div><div className="hero-art" aria-label="Greater Height Books cover selection">{[english[0], mathematics[0], english[1]].filter(Boolean).map((book,i) => <div key={book.slug} className="hero-book"><BookCover book={book} priority={i === 0}/></div>)}</div></div>
    <section className="wrap book-section"><div className="section-heading"><div><div className="eyebrow">The collection</div><h2 className="section-title">English books</h2></div><Link href="/shop?subject=English" className="text-link">View all English →</Link></div><div className="book-grid">{english.map(book => <BookCard key={book.slug} book={book}/>)}</div></section>
    <section className="wrap book-section"><div className="section-heading"><div><div className="eyebrow">The collection</div><h2 className="section-title">Mathematics books</h2></div><Link href="/shop?subject=Mathematics" className="text-link">View all Mathematics →</Link></div><div className="book-grid">{mathematics.map(book => <BookCard key={book.slug} book={book}/>)}</div></section>
    <section id="about" className="about-strip"><div className="wrap"><h2 className="section-title">Learning, one book at a time.</h2><p className="body-copy">Greater Height Books brings together verbal and quantitative reasoning books by F.O. Bamidele. Browse the current collection and choose the books your learner needs.</p></div></section>
  </>;
}
