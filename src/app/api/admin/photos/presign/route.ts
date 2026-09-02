import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { createUploadUrl } from "@/lib/storage";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeFilename(name: string, fallback: string) {
  const cleaned = name
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+/, "")
    .slice(-120);
  return cleaned || fallback;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const b = await req.json();
    const originalName = String(b.originalName || "");
    const previewName = String(b.previewName || "");
    const originalType = String(b.originalType || "").toLowerCase();
    const previewType = String(b.previewType || "").toLowerCase();
    const originalSize = Number(b.originalSize || 0);
    const previewSize = Number(b.previewSize || 0);

    if (!originalName || !previewName || !ALLOWED_IMAGE_TYPES.has(originalType) || !ALLOWED_IMAGE_TYPES.has(previewType)) {
      return NextResponse.json({ error: "Original and preview must be JPG, PNG or WebP images." }, { status: 400 });
    }
    if (
      !Number.isInteger(originalSize) || !Number.isInteger(previewSize) ||
      originalSize <= 0 || previewSize <= 0 ||
      originalSize > MAX_IMAGE_BYTES || previewSize > MAX_IMAGE_BYTES
    ) {
      return NextResponse.json({ error: "Each image must be smaller than 25 MB." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const safeOriginal = safeFilename(originalName, "original.jpg");
    const safePreview = safeFilename(previewName, "preview.jpg");
    const originalKey = `originals/${id}-${safeOriginal}`;
    const previewKey = `previews/${id}-${safePreview}`;

    const [original, preview] = await Promise.all([
      createUploadUrl(originalKey, originalType),
      createUploadUrl(previewKey, previewType),
    ]);

    // The B2 PUT can take long enough that a second authenticated request may
    // occasionally lose the browser session. Give the upload a short-lived
    // completion token so the final save can be completed without bouncing
    // the user back to the login page. The token is server-verifiable and
    // contains no credentials.
    const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.DATABASE_URL || "tong-an-upload";
    const payload = Buffer.from(JSON.stringify({
      userId: admin.id,
      originalKey, previewKey, originalSize, previewSize, originalType, previewType,
      exp: Date.now() + 15 * 60 * 1000,
    })).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    const completionToken = `${payload}.${sig}`;

    return NextResponse.json({
      original: { url: original, key: originalKey, size: originalSize, contentType: originalType },
      preview: { url: preview, key: previewKey, size: previewSize, contentType: previewType },
      completionToken,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload setup failed.";
    const status = message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
