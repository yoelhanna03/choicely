import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const bilan = await db.bilan.findFirst({
    where: { by_email: session.user.email },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bilan: bilan?.bilan ?? null });
}