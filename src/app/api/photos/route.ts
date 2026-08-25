import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

export async function GET() {
  const photos = await prisma.photo.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const result = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.category.name,
      priceCents: p.priceCents,
      description: p.description,
      previewStorageKey: await createDownloadUrl(p.previewStorageKey),
    })),
  );

  return NextResponse.json(result);
}
