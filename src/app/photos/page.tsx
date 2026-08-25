export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

const FILTERS = [
  { label: "All photographs", value: "" },
  { label: "Cambodia", value: "cambodia" },
  { label: "Landscape", value: "landscape" },
  { label: "Portrait", value: "portrait" },
  { label: "Architecture", value: "architecture" },
];

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = (params.category || "").toLowerCase();

  const photos = await prisma.photo.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const photosWithUrls = await Promise.all(
    photos.map(async (p) => ({ ...p, previewUrl: await createDownloadUrl(p.previewStorageKey) })),
  );

  return (
    <main className="container section gallery-page">
      <div className="page-heading">
        <p className="eyebrow">THE COLLECTION</p>
        <h1>Photographs from Cambodia</h1>
        <p className="lead">
          Original images made by Tong An Photography. Explore by subject and open any
          photograph to see the story, price and licensing details.
        </p>
      </div>

      <div className="filter-pills" aria-label="Photo collections">
        {FILTERS.map((item) => {
          const active = item.value === category;
          return (
            <Link
              key={item.label}
              href={item.value ? `/photos?category=${item.value}` : "/photos"}
              className={`filter-pill ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="gallery-toolbar">
        <span>{photosWithUrls.length} photograph{photosWithUrls.length === 1 ? "" : "s"}{category ? ` in ${category}` : ""}</span>
        <span>Click an image for details →</span>
      </div>

      {photosWithUrls.length ? (
        <div className="photo-grid gallery-grid">
          {photosWithUrls.map((p) => (
            <Link key={p.id} href={`/photos/${p.slug}`} className="card photo-card">
              <div className="photo-image-wrap">
                <img className="photo-grid-image" src={p.previewUrl || p.previewStorageKey} alt={`${p.title} — ${p.category.name}`} loading="lazy" />
                <span className="photo-badge">{p.category.name}</span>
              </div>
              <div className="photo-info">
                <div>
                  <div className="photo-title">{p.title}</div>
                  <small>Licensed original · Digital download</small>
                </div>
                <div className="price">${(p.priceCents / 100).toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty card">
          <strong>No photographs in this collection yet.</strong>
          <p>Try another collection or browse all photographs.</p>
          <Link className="btn btn-gold" href="/photos">View all photographs</Link>
        </div>
      )}
    </main>
  );
}
