export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

export default async function PhotoDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.photo.findUnique({ where: { slug }, include: { category: true } });
  if (!p || p.status !== "PUBLISHED") return notFound();

  const previewUrl = await createDownloadUrl(p.previewStorageKey);

  const description =
    p.description ||
    "An original photograph from Tong An Photography, captured in Cambodia.";

  return (
    <main className="container section detail-page">
      <Link href="/photos" className="back-link">← Back to gallery</Link>
      <div className="detail-grid">
        <div>
          <div className="detail-image card">
            <img src={previewUrl} alt={`${p.title} — ${p.category.name}, Cambodia`} />
          </div>
          <p className="image-protection-note">Preview image shown for browsing. The original file is delivered after payment approval.</p>
        </div>

        <aside className="detail-copy">
          <p className="eyebrow">FOR SALE · {p.category.name} · CAMBODIA</p>
          <h1>{p.title}</h1>
          <p className="lead">{description}</p>

          <div className="detail-meta">
            <div><span>Collection</span><strong>{p.category.name}</strong></div>
            <div><span>Delivery</span><strong>Digital download</strong></div>
            <div><span>License</span><strong>Licensed original image</strong></div>
          </div>

          <div className="detail-buy">
            <div>
              <small>Digital license</small>
              <div className="detail-price">${(p.priceCents / 100).toFixed(2)}</div>
            </div>
            <Link className="btn btn-gold" href={`/cart?add=${p.id}`}>Add to Cart · Buy Photo</Link>
          </div>

          <div className="license-note">
            <strong>What you receive</strong>
            <ul>
              <li>Original high-quality digital file</li>
              <li>Private download link after payment verification</li>
              <li>Download access for {7} days, up to 5 downloads</li>
            </ul>
            <p>Need commercial, editorial, print or extended usage? <Link className="text-link" href="/contact">Contact Tong An Photography</Link>.</p>
          </div>

          <div className="purchase-steps">
            <div><b>1</b><span>Add the photograph to your cart.</span></div>
            <div><b>2</b><span>Pay by the displayed QR code and upload your receipt.</span></div>
            <div><b>3</b><span>After verification, return to your order page and download the original.</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}
