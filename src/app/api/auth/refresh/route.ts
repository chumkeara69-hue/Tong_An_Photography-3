import { NextResponse } from "next/server";
import { refreshSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const ok = await refreshSessionCookie();
  return NextResponse.json(
    ok ? { authenticated: true } : { authenticated: false },
    {
      status: ok ? 200 : 401,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
