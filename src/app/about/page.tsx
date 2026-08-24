import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container section about-page">
      <div className="page-heading narrow">
        <p className="eyebrow">ABOUT THE PHOTOGRAPHER</p>
        <h1>Photography with a sense of place.</h1>
        <p className="lead">
          Tong An Photography is a personal collection of original images focused on Cambodia:
          its people, landscapes, architecture, culture, and everyday moments.
        </p>
      </div>

      <div className="about-content">
        <div className="card about-panel">
          <p className="eyebrow">THE APPROACH</p>
          <h2>Simple moments. Honest images.</h2>
          <p>
            I look for photographs that feel timeless rather than staged — warm light on an old
            building, a quiet street, a familiar face, or a landscape at the right moment.
          </p>
          <p>
            Each image is captured as an original work and prepared for high-quality licensed use.
            The goal is simple: preserve a real sense of Cambodia that still feels authentic years later.
          </p>
          <div className="about-facts">
            <div><strong>Focus</strong><span>Cambodia & everyday stories</span></div>
            <div><strong>Style</strong><span>Natural, timeless, place-driven</span></div>
            <div><strong>Delivery</strong><span>High-quality digital originals</span></div>
          </div>
          <Link className="btn btn-gold" href="/photos">View the collection</Link>
        </div>

        <div className="about-statement">
          <span className="quote-mark">“</span>
          <p>Photography is a way of keeping a moment that would otherwise disappear.</p>
          <small>Authentic scenes. Quiet details. Cambodia.</small>
        </div>
      </div>
    </main>
  );
}
