import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ downloadId: string }> },
) {
  const { downloadId } = await params;

  const d = await prisma.download.findUnique({
    where: { id: downloadId },
    include: { orderItem: { include: { order: true, photo: true } } },
  });

  if (!d) return NextResponse.json({ error: "Download not found" }, { status: 404 });
  if (d.orderItem.order.paymentStatus !== "PAID") {
    return NextResponse.json({ error: "Payment is not verified." }, { status: 403 });
  }
  if (d.expiresAt < new Date()) {
    return NextResponse.json({ error: "Download link expired." }, { status: 410 });
  }
  if (d.downloadCount >= d.maxDownloads) {
    return NextResponse.json({ error: "Download limit reached." }, { status: 429 });
  }

  const url = await createDownloadUrl(d.orderItem.photo.originalStorageKey, {
    attachment: true,
    filename: d.orderItem.photo.originalStorageKey.split("/").pop() || d.orderItem.photo.title,
    expiresIn: 10 * 60,
  });

  await prisma.download.update({
    where: { id: d.id },
    data: { downloadCount: { increment: 1 } },
  });

  return NextResponse.redirect(url);
}
