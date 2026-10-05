import Link from "next/link";

export function Header() {
  return <header className="site-header"><div className="wrap header-inner">
    <Link href="/" className="brand" aria-label="Greater Height Books home">Greater Height<br/>Books</Link>
    <nav className="nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/#about">About</Link></nav>
    <div className="header-actions"><Link href="/account">Account</Link><Link href="/cart">Cart</Link></div>
  </div></header>;
}
