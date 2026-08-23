import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="container section contact-page">
      <div className="page-heading narrow">
        <p className="eyebrow">GET IN TOUCH</p>
        <h1>Let's talk about a photograph.</h1>
        <p className="lead">For licensing questions, commercial use, collaborations, or general enquiries, get in touch with Tong An Photography.</p>
      </div>
      <div className="contact-grid">
        <div className="card contact-card">
          <span className="contact-label">Photography & licensing</span>
          <h2>Interested in using an image?</h2>
          <p>Tell me which photograph you are interested in and how you plan to use it. I can help with licensing and availability.</p>
          <Link className="btn btn-gold" href="/photos">Browse Photos</Link>
        </div>
        <div className="card contact-card">
          <span className="contact-label">General enquiry</span>
          <h2>Start a conversation.</h2>
          <p className="muted">Add your preferred email address or social profile here when you are ready to publish the site.</p>
        </div>
      </div>
    </main>
  );
}
