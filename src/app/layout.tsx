import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container nav-wrap">
            <Link href="/" className="brand" aria-label="Tong An Photography home">
              <span>TONG AN</span>
              <small>PHOTOGRAPHY</small>
            </Link>
            <nav className="main-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/photos">Photos</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link className="nav-cart" href="/cart">Cart</Link>
              <Link className="nav-admin" href="/admin/login">Admin</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <Link href="/" className="brand footer-brand">
                <span>TONG AN</span>
                <small>PHOTOGRAPHY</small>
              </Link>
              <p>Original photography from Cambodia and beyond.</p>
            </div>
            <div className="footer-links">
              <Link href="/photos">Photos</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/cart">Cart</Link>
            </div>
            <div className="footer-meta">
              <span>© 2026 Tong An Photography</span>
              <span>Original work · Licensed downloads</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
