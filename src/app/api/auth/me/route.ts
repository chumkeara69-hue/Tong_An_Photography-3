import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    user
      ? { authenticated: true, role: user.role, email: user.email }
      : { authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
