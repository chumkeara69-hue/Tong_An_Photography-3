import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
export async function GET(){await destroySession();return NextResponse.redirect(new URL("/admin/login", "https://tong-an-photography-3-nntn.vercel.app"));}
