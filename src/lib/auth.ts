import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "tong_an_session_v2";
const TTL_DAYS = 7;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86400000);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_DAYS * 24 * 60 * 60,
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  store.delete(COOKIE);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (!session.user || session.user.role !== "ADMIN" && session.user.role !== "CUSTOMER") return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const nextExpiry = new Date(Date.now() + TTL_DAYS * 86400000);
  await prisma.session.update({ where: { id: session.id }, data: { expiresAt: nextExpiry } }).catch(() => {});

  // Do not modify cookies here. This function is used by Server Components
  // where cookies().set() is not allowed in Next.js.
  return session.user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}


/**
 * Refresh the browser session cookie from a route handler.
 * Server Components must not call cookies().set(), so upload/login flows
 * can explicitly refresh the cookie when they are handling a request.
 */
export async function refreshSessionCookie() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || !session.user || session.user.role !== "ADMIN") return false;
  if (session.expiresAt <= new Date()) return false;

  const expiresAt = new Date(Date.now() + TTL_DAYS * 86400000);
  await prisma.session.update({
    where: { id: session.id },
    data: { expiresAt },
  });

  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_DAYS * 24 * 60 * 60,
    expires: expiresAt,
  });

  return true;
}
