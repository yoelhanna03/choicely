import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/auth/verify?error=invalid", req.url));
  }

  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
    select: { identifier: true, expires: true },
  });

  if (!verificationToken || verificationToken.identifier !== email) {
    return NextResponse.redirect(new URL("/auth/verify?error=invalid", req.url));
  }

  if (verificationToken.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(new URL("/auth/verify?error=expired", req.url));
  }

  await db.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await db.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/auth/verify?success=true", req.url));
}