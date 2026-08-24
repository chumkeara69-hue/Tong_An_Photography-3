import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="container section contact-page">
      <div className="page-heading narrow">
        <p className="eyebrow">LICENSING & COLLABORATION</p>
        <h1>Let’s talk about a photograph.</h1>
        <p className="lead">
          Need an image for a campaign, editorial story, publication, website, print,
          or another commercial project? Tell Tong An what you need and how you plan to use it.
        </p>
      </div>

      <div className="contact-grid">
        <div className="card contact-card">
          <span className="contact-label">Browse first</span>
          <h2>Find an image you love.</h2>
          <p>
            Explore the collection, open a photograph for its details, then add it to your cart.
            Every listed image is an original work.
          </p>
          <Link className="btn btn-gold" href="/photos">Browse the Gallery</Link>
        </div>

        <div className="card contact-card">
          <span className="contact-label">Custom licensing</span>
          <h2>Have a specific use?</h2>
          <p>
            For commercial, editorial, print, exclusive, or custom licensing requests,
            contact Tong An directly. Include the image title, intended use, territory,
            duration, and approximate audience if available.
          </p>
          <a className="btn btn-dark" href="mailto:hello@tonganphotography.com">Email Tong An</a>
          <p className="muted small contact-note">
            If this email is not configured yet, replace it with your preferred business email before launch.
          </p>
        </div>
      </div>

      <div className="contact-process">
        <div><b>01</b><span>Choose a photograph</span></div>
        <div><b>02</b><span>Tell us your intended use</span></div>
        <div><b>03</b><span>Receive licensing guidance</span></div>
      </div>
    </main>
  );
}
