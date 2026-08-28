import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order?.paymentProofStorageKey) {
      return NextResponse.json({ error: "No proof" }, { status: 404 });
    }

    const url = await createDownloadUrl(order.paymentProofStorageKey, {
      expiresIn: 5 * 60,
      filename: order.paymentProofStorageKey.split("/").pop() || "payment-receipt",
    });

    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
