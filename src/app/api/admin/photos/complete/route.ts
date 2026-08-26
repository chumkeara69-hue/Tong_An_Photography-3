import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { verifyObject } from "@/lib/storage";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    const title = String(b.title || "").trim();
    const categoryName = String(b.category || "").trim();
    const description = String(b.description || "").trim() || null;
    const priceCents = Number(b.priceCents);
    const previewStorageKey = String(b.previewStorageKey || "");
    const originalStorageKey = String(b.originalStorageKey || "");
    const previewSize = Number(b.previewSize || 0);
    const originalSize = Number(b.originalSize || 0);
    const previewContentType = String(b.previewContentType || "").toLowerCase();
    const originalContentType = String(b.originalContentType || "").toLowerCase();

    if (!title || !categoryName || !Number.isSafeInteger(priceCents) || priceCents < 1) {
      return NextResponse.json({ error: "Title, category and a valid price are required." }, { status: 400 });
    }
    if (!previewStorageKey.startsWith("previews/") || !originalStorageKey.startsWith("originals/")) {
      return NextResponse.json({ error: "Invalid storage keys." }, { status: 400 });
    }
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (
      !Number.isInteger(previewSize) || previewSize <= 0 || previewSize > MAX_IMAGE_BYTES ||
      !Number.isInteger(originalSize) || originalSize <= 0 || originalSize > MAX_IMAGE_BYTES ||
      !allowedTypes.has(previewContentType) || !allowedTypes.has(originalContentType)
    ) {
      return NextResponse.json({ error: "Invalid upload sizes." }, { status: 400 });
    }

    // Do not create the database record until B2 confirms both objects exist.
    await Promise.all([
      verifyObject(originalStorageKey, originalSize, originalContentType),
      verifyObject(previewStorageKey, previewSize, previewContentType),
    ]);

    const categorySlug = slugify(categoryName);
    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) category = await prisma.category.create({ data: { name: categoryName, slug: categorySlug } });

    const base = slugify(title) || "photo";
    const slug = `${base}-${Date.now()}`;
    const photo = await prisma.photo.create({
      data: {
        title,
        slug,
        description,
        priceCents,
        status: "PUBLISHED",
        categoryId: category.id,
        previewStorageKey,
        originalStorageKey,
      },
    });

    return NextResponse.json({ id: photo.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create photo";
    const status = message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
