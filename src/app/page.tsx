import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const photos = await prisma.photo.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { category: true },
  });

  return (
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">TONG AN PHOTOGRAPHY · CAMBODIA</p>
            <h1>Moments worth<br /><em>remembering.</em></h1>
            <p className="lead">
              Original photography capturing Cambodia, its landscapes, people,
              and quiet everyday beauty — available as high-quality licensed images.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" href="/photos">Explore the Gallery</Link>
              <Link className="btn btn-ghost" href="/about">About the Photographer</Link>
            </div>
          </div>
          {photos[0] ? (
            <Link href={`/photos/${photos[0].slug}`} className="hero-image-wrap" aria-label={`View ${photos[0].title}`}>
              <img className="hero-image" src={photos[0].previewStorageKey} alt={photos[0].title} />
              <span className="hero-caption">{photos[0].title} · {photos[0].category.name}</span>
            </Link>
          ) : (
            <div className="hero-image-wrap">
              <img className="hero-image" src="/version-3-preview.png" alt="Tong An Photography" />
            </div>
          )}
        </div>
      </section>

      <section className="container section section-tight">
        <div className="section-intro">
          <div>
            <p className="eyebrow">SELECTED WORK</p>
            <h2>Latest photographs</h2>
          </div>
          <Link className="text-link" href="/photos">View all photos <span>→</span></Link>
        </div>

        {photos.length ? (
          <div className="photo-grid home-grid">
            {photos.map((p, index) => (
              <Link
                key={p.id}
                href={`/photos/${p.slug}`}
                className={`card photo-card photo-card-${index % 3}`}
              >
                <div className="photo-image-wrap">
                  <img src={p.previewStorageKey} alt={p.title} loading={index > 2 ? "lazy" : "eager"} />
                  <span className="photo-badge">{p.category.name}</span>
                </div>
                <div className="photo-info">
                  <div>
                    <div className="photo-title">{p.title}</div>
                    <small>Licensed original</small>
                  </div>
                  <div className="price">${(p.priceCents / 100).toFixed(2)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty card">Your published photographs will appear here.</div>
        )}
      </section>

      <section className="collections-section">
        <div className="container section">
          <div className="section-intro centered">
            <div>
              <p className="eyebrow">EXPLORE</p>
              <h2>Stories through the lens</h2>
              <p className="muted section-description">
                A visual collection of places, people, and details that make Cambodia unforgettable.
              </p>
            </div>
          </div>
          <div className="collection-grid">
            {[
              ["Cambodia", "Temples, streets & local life"],
              ["Landscape", "Light, land & open skies"],
              ["Portrait", "People & personal stories"],
              ["Architecture", "Shapes, history & detail"],
            ].map(([title, subtitle]) => (
              <Link key={title} href="/photos" className="collection-card">
                <span>{title}</span>
                <small>{subtitle}</small>
                <b>Explore →</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section about-strip">
        <div className="about-copy">
          <p className="eyebrow">THE STORY</p>
          <h2>Photography with a sense of place.</h2>
          <p className="lead">
            Every photograph is a small record of a real moment. Tong An Photography
            focuses on authentic Cambodian scenes and timeless images made to be remembered.
          </p>
          <Link className="btn btn-dark" href="/about">Meet Tong An</Link>
        </div>
        <div className="about-note">
          <span className="quote-mark">“</span>
          <p>See the beauty in the ordinary, then preserve it.</p>
        </div>
      </section>
    </main>
  );
}
