export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

export default async function Home() {
  const photos = await prisma.photo.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { category: true },
  });

  const photosWithUrls = await Promise.all(
    photos.map(async (p) => ({ ...p, previewUrl: await createDownloadUrl(p.previewStorageKey) })),
  );

  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">TONG AN PHOTOGRAPHY · CAMBODIA</p>
            <h1>See Cambodia.<br /><em>Keep the moment.</em></h1>
            <p className="lead">
              Original photography of Cambodia — landscapes, people, architecture,
              culture, and the quiet details of everyday life. Browse the collection
              and license high-quality digital images.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" href="/photos">Explore the Gallery</Link>
              <Link className="btn btn-ghost" href="/about">Meet the Photographer</Link>
            </div>
            <div className="hero-proof" aria-label="Store highlights">
              <span>Original photographs</span>
              <span>Licensed digital files</span>
              <span>Payment verified manually</span>
            </div>
          </div>

          {photosWithUrls[0] ? (
            <Link href={`/photos/${photosWithUrls[0].slug}`} className="hero-image-wrap" aria-label={`View ${photosWithUrls[0].title}`}>
              <img className="hero-image" src={photosWithUrls[0].previewUrl || photosWithUrls[0].previewStorageKey} alt={photosWithUrls[0].title} />
              <span className="hero-caption">
                <strong>{photosWithUrls[0].title}</strong>
                <small>{photosWithUrls[0].category.name} · View photograph →</small>
              </span>
            </Link>
          ) : (
            <div className="hero-image-wrap">
              <img className="hero-image" src="/version-3-preview.png" alt="Tong An Photography — Cambodia" />
            </div>
          )}
        </div>
      </section>

      <section className="container trust-strip" aria-label="Why buy from Tong An Photography">
        <div><strong>Original work</strong><span>Captured by Tong An</span></div>
        <div><strong>High-quality files</strong><span>Digital download after approval</span></div>
        <div><strong>Simple licensing</strong><span>Ask about commercial use</span></div>
        <div><strong>Human verified</strong><span>Payment reviewed before download</span></div>
      </section>

      <section className="container section section-tight">
        <div className="section-intro">
          <div>
            <p className="eyebrow">SELECTED WORK</p>
            <h2>Latest photographs</h2>
            <p className="muted section-description-left">A curated starting point. Open any image for details, licensing information and purchase.</p>
          </div>
          <Link className="text-link" href="/photos">View the full collection <span>→</span></Link>
        </div>

        {photosWithUrls.length ? (
          <div className="photo-grid home-grid">
            {photosWithUrls.map((p, index) => (
              <Link key={p.id} href={`/photos/${p.slug}`} className="card photo-card">
                <div className="photo-image-wrap">
                  <img className="photo-grid-image" src={p.previewUrl || p.previewStorageKey} alt={`${p.title} — ${p.category.name}`} loading={index > 2 ? "lazy" : "eager"} />
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
          <div className="empty card">
            <strong>The collection is being prepared.</strong>
            <p>New photographs will appear here soon.</p>
            <Link className="btn btn-gold" href="/contact">Ask about upcoming work</Link>
          </div>
        )}
      </section>

      <section className="collections-section">
        <div className="container section">
          <div className="section-intro centered">
            <div>
              <p className="eyebrow">EXPLORE THE COLLECTION</p>
              <h2>Stories through the lens</h2>
              <p className="muted section-description">
                Start with a subject, then discover the places, people and details that make Cambodia unforgettable.
              </p>
            </div>
          </div>
          <div className="collection-grid">
            {[
              ["Cambodia", "Temples, streets & local life", "cambodia"],
              ["Landscape", "Light, land & open skies", "landscape"],
              ["Portrait", "People & personal stories", "portrait"],
              ["Architecture", "Shapes, history & detail", "architecture"],
            ].map(([title, subtitle, slug]) => (
              <Link key={title} href={`/photos?category=${slug}`} className="collection-card">
                <span>{title}</span>
                <small>{subtitle}</small>
                <b>Explore collection →</b>
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
          <div className="hero-actions">
            <Link className="btn btn-dark" href="/about">Meet Tong An</Link>
            <Link className="btn btn-ghost" href="/contact">Licensing enquiries</Link>
          </div>
        </div>
        <div className="about-note">
          <span className="quote-mark">“</span>
          <p>See the beauty in the ordinary, then preserve it.</p>
          <small>— Tong An Photography</small>
        </div>
      </section>
    </main>
  );
}
