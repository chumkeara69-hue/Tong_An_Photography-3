import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PhotosPage() {
  const photos = await prisma.photo.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <main className="container section gallery-page">
      <div className="page-heading">
        <p className="eyebrow">THE COLLECTION</p>
        <h1>Browse photographs</h1>
        <p className="lead">Original images from Tong An Photography, made in Cambodia and available for licensing.</p>
      </div>

      <div className="filter-pills" aria-label="Photo collections">
        {["All photographs", "Cambodia", "Landscape", "Portrait", "Architecture"].map((item, i) => (
          <span key={item} className={`filter-pill ${i === 0 ? "active" : ""}`}>{item}</span>
        ))}
      </div>

      {photos.length ? (
        <div className="photo-grid gallery-grid">
          {photos.map((p) => (
            <Link key={p.id} href={`/photos/${p.slug}`} className="card photo-card">
              <div className="photo-image-wrap">
                <img src={p.previewStorageKey} alt={p.title} loading="lazy" />
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
        <div className="empty card">No published photographs yet.</div>
      )}
    </main>
  );
}
