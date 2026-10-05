import Link from "next/link";
export default function NotFound() { return <div className="wrap empty-state"><h1 className="page-title">We couldn’t find that page.</h1><p className="body-copy">The book or page you requested may have moved.</p><Link href="/shop" className="button">Browse Books</Link></div>; }
