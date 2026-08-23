import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PhotoDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.photo.findUnique({ where: { slug }, include: { category: true } });
  if (!p || p.status !== "PUBLISHED") return notFound();

  return (
    <main className="container section detail-page">
      <Link href="/photos" className="back-link">← Back to gallery</Link>
      <div className="detail-grid">
        <div className="detail-image card">
          <img src={p.previewStorageKey} alt={p.title} />
        </div>
        <aside className="detail-copy">
          <p className="eyebrow">{p.category.name}</p>
          <h1>{p.title}</h1>
          <p className="lead">{p.description || "An original licensed photograph from Tong An Photography."}</p>

          <div className="detail-meta">
            <div><span>Collection</span><strong>{p.category.name}</strong></div>
            <div><span>License</span><strong>High-quality digital download</strong></div>
          </div>

          <div className="detail-buy">
            <div>
              <small>License price</small>
              <div className="detail-price">${(p.priceCents / 100).toFixed(2)}</div>
            </div>
            <Link className="btn btn-gold" href={`/cart?add=${p.id}`}>Add to Cart</Link>
          </div>

          <div className="license-note">
            <strong>What you receive</strong>
            <p>Access to the original file after payment is verified. The preview shown here is protected.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
