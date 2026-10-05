import Link from "next/link";

export function Footer() {
  return <footer className="site-footer"><div className="wrap">
    <div className="footer-inner"><div className="brand">Greater Height<br/>Books</div><nav className="footer-nav" aria-label="Footer navigation"><Link href="/shop">Shop all books</Link><Link href="/shop?subject=English">English</Link><Link href="/shop?subject=Mathematics">Mathematics</Link><Link href="/privacy">Privacy</Link></nav></div>
    <p className="footer-note">© {new Date().getFullYear()} Greater Height Books. Educational books by F.O. Bamidele.</p>
  </div></footer>;
}
