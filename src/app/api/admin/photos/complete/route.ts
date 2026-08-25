import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

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

    if (!title || !categoryName || !Number.isInteger(priceCents) || priceCents < 1) {
      return NextResponse.json({ error: "Title, category and a valid price are required." }, { status: 400 });
    }
    if (!previewStorageKey.startsWith("previews/") || !originalStorageKey.startsWith("originals/")) {
      return NextResponse.json({ error: "Invalid storage keys." }, { status: 400 });
    }

    const categorySlug = slugify(categoryName);
    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName, slug: categorySlug } });
    }

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
