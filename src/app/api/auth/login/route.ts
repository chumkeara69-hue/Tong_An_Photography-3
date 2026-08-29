import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.role !== "ADMIN" ||
      !user.passwordHash ||
      !(await bcrypt.compare(body.password, user.passwordHash))
    ) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json(
      { ok: true, role: user.role },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
