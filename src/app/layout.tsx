import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://tong-an-photography-2-im4z.vercel.app"),
  title: {
    default: "Tong An Photography | Cambodia",
    template: "%s | Tong An Photography",
  },
  description:
    "Original photography from Cambodia — landscapes, people, architecture, culture, and everyday moments available as high-quality licensed images.",
  keywords: [
    "Cambodia photographer",
    "Cambodian photography",
    "Cambodia photos",
    "Phnom Penh photography",
    "Cambodia stock photos",
    "licensed photography",
    "Tong An Photography",
  ],
  openGraph: {
    title: "Tong An Photography | Cambodia",
    description:
      "Original photography capturing Cambodia, its people, landscapes, architecture and everyday beauty.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tong An Photography | Cambodia",
    description:
      "Original photography from Cambodia and licensed digital images.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
          <div className="container nav-wrap">
            <Link href="/" className="brand" aria-label="Tong An Photography home">
              <span>TONG AN</span>
              <small>PHOTOGRAPHY · CAMBODIA</small>
            </Link>
            <nav className="main-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/photos">Gallery</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link className="nav-cart" href="/cart">Cart</Link>
            </nav>
          </div>
        </header>

        <div id="main-content">{children}</div>

        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <Link href="/" className="brand footer-brand">
                <span>TONG AN</span>
                <small>PHOTOGRAPHY · CAMBODIA</small>
              </Link>
              <p>Original photography from Cambodia — places, people, culture and quiet everyday moments.</p>
            </div>
            <div className="footer-links">
              <Link href="/photos">Gallery</Link>
              <Link href="/about">About the photographer</Link>
              <Link href="/contact">Licensing & contact</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/admin/login">Admin sign in</Link>
            </div>
            <div className="footer-meta">
              <span>© 2026 Tong An Photography</span>
              <span>Original work · Licensed downloads</span>
              <span>Secure payment verification · Private download links</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
