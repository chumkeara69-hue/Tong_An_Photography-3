import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function GET(_: Request, { params }: { params: Promise<{ downloadId: string }> }) {
  const { downloadId } = await params;
  const d = await prisma.download.findUnique({ where: { id: downloadId }, include: { orderItem: { include: { order: true, photo: true } } } });
  if (!d) return NextResponse.json({ error: "Download not found" }, { status: 404 });
  if (d.orderItem.order.paymentStatus !== "PAID") return NextResponse.json({ error: "Payment is not verified." }, { status: 403 });
  if (d.expiresAt < new Date()) return NextResponse.json({ error: "Download link expired." }, { status: 410 });
  if (d.downloadCount >= d.maxDownloads) return NextResponse.json({ error: "Download limit reached." }, { status: 429 });
  const { createDownloadUrl } = await import("@/lib/storage");
  const url = await createDownloadUrl(d.orderItem.photo.originalStorageKey);

  await prisma.download.update({ where: { id: d.id }, data: { downloadCount: { increment: 1 } } });
  return NextResponse.redirect(url);
}
